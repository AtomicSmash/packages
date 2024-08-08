import { unlink, writeFile } from "node:fs";
import { dirname as pathDirname, sep as pathSeparator } from "node:path";
import { fileURLToPath } from "node:url";
import { rimraf } from "rimraf";
import { execute, packageJson } from "./src/utils.js";

const packageName = packageJson.name;
const packageVersion = packageJson.version;
function isValidPackageName(
	packageName: string | undefined,
): packageName is string {
	return !!packageName;
}
function isValidPackageVersion(
	packageVersion: string | undefined,
): packageVersion is string {
	return !!packageVersion;
}
if (
	!isValidPackageName(packageName) ||
	!isValidPackageVersion(packageVersion)
) {
	throw new Error("Invalid package, must have name and version");
}
const packName = `${packageName
	.replaceAll("@", "")
	.replaceAll(`/`, "-")}-${packageVersion}.tgz`;

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const packageDir = pathDirname(__filename);

export async function setup() {
	console.log("Packing a test version...");
	await execute(
		`cd ${packageDir} && npm pack --pack-destination ${[packageDir, "src", "tests", "artifacts"].join(pathSeparator)}`,
		{ debug: true },
	);
	console.log(`Install test package...`);
	writeFile(
		`${[packageDir, "src", "tests", "package.json"].join(pathSeparator)}`,
		"{}",
		(err) => {
			if (err) {
				console.log("writeFile failed");
				throw err;
			}
		},
	);
	await execute(
		`cd ${[packageDir, "src", "tests"].join(pathSeparator)} && npm pkg set type=module && npm pkg set dependencies.@atomicsmash/cli=file:${[packageDir, "src", "tests", "artifacts", packName].join(pathSeparator)} && npm install`,
		{ debug: true },
	);
}

export async function teardown() {
	console.log("Deleting test package...");
	unlink(
		`${[packageDir, "src", "tests", "artifacts", packName].join(pathSeparator)}`,
		(err) => {
			if (err) {
				if (err.code === "ENOENT") {
					return;
				}
				throw err;
			}
		},
	);
	console.log("Deleting node modules...");
	await rimraf([
		[packageDir, "src", "tests", "node_modules"].join(pathSeparator),
		[packageDir, "src", "tests", "package.json"].join(pathSeparator),
		[packageDir, "src", "tests", "package-lock.json"].join(pathSeparator),
	]);
}
