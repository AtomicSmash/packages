import { unlink, writeFile } from "node:fs";
import { resolve as resolvePath, dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execute, packageJson } from "./utils";

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
const __dirname = pathDirname(__filename);

export async function setup() {
	console.log("Packing a test version...");
	await execute(
		`cd ${resolvePath(
			__dirname,
			"../",
		)} && ls && npm pack --pack-destination ${__dirname}/tests/artifacts`,
		{ debug: true },
	);
	console.log(`Install test package...`);
	writeFile(`${__dirname}/tests/package.json`, "{}", (err) => {
		if (err) {
			console.log("writeFile failed");
			throw err;
		}
	});
	await execute(
		`cd ${__dirname}/tests && npm pkg set dependencies.@atomicsmash/cli=file:${__dirname}/tests/artifacts/${packName} && npm install`,
		{ debug: true },
	);
}

export async function teardown() {
	console.log("Deleting test package...");
	unlink(`${__dirname}/tests/artifacts/${packName}`, (err) => {
		if (err) throw err;
	});
	console.log("Deleting node modules...");
	await execute(
		`cd ${__dirname}/tests && rm -rf node_modules package.json package-lock.json`,
		{ debug: true },
	);
}
