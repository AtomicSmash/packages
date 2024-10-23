import { unlink, writeFile } from "node:fs";
import { sep as pathSeparator } from "node:path";
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

export async function setup() {
	console.log("Packing a test version...");
	await execute(
		`cd ${import.meta.dirname} && npm pack --pack-destination ${[import.meta.dirname, "src", "tests", "artifacts"].join(pathSeparator)}`,
		{ debug: true },
	);
	console.log(`Install test package...`);
	writeFile(
		`${[import.meta.dirname, "src", "tests", "package.json"].join(pathSeparator)}`,
		"{}",
		(err) => {
			if (err) {
				console.log("writeFile failed");
				throw err;
			}
		},
	);
	await execute(
		`cd ${[import.meta.dirname, "src", "tests"].join(pathSeparator)} && npm pkg set type=module && npm pkg set dependencies.@atomicsmash/cli=file:${[import.meta.dirname, "src", "tests", "artifacts", packName].join(pathSeparator)} && npm install`,
		{ debug: true },
	);
}

export async function teardown() {
	console.log("Deleting test package...");
	unlink(
		`${[import.meta.dirname, "src", "tests", "artifacts", packName].join(pathSeparator)}`,
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
		[import.meta.dirname, "src", "tests", "node_modules"].join(pathSeparator),
		[import.meta.dirname, "src", "tests", "package.json"].join(pathSeparator),
		[import.meta.dirname, "src", "tests", "package-lock.json"].join(
			pathSeparator,
		),
	]);
}
