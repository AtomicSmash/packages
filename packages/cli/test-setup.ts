import { unlink, writeFile } from "node:fs";
import { dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";
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
		`cd ${packageDir} && ls && npm pack --pack-destination ${packageDir}/src/tests/artifacts`,
		{ debug: true },
	);
	console.log(`Install test package...`);
	writeFile(`${packageDir}/src/tests/package.json`, "{}", (err) => {
		if (err) {
			console.log("writeFile failed");
			throw err;
		}
	});
	await execute(
		`cd ${packageDir}/src/tests && npm pkg set dependencies.@atomicsmash/cli=file:${packageDir}/src/tests/artifacts/${packName} && npm install`,
		{ debug: true },
	);
}

export async function teardown() {
	console.log("Deleting test package...");
	unlink(`${packageDir}/src/tests/artifacts/${packName}`, (err) => {
		if (err) throw err;
	});
	console.log("Deleting node modules...");
	await execute(
		`cd ${packageDir}/src/tests && rm -rf node_modules package.json package-lock.json`,
		{ debug: true },
	);
}
