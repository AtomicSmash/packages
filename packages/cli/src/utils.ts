import type { ExecException } from "node:child_process";
import type { PackageJson } from "type-fest";
import { exec } from "node:child_process";
import { createRequire } from "node:module";
import { dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = pathDirname(__filename);

const require = createRequire(import.meta.url);
export const packageJson = require("../package.json") as PackageJson;
if (packageJson.bin === undefined) {
	throw new Error("Script name is not defined.");
}
export const mainCommand = Object.keys(packageJson.bin)[0];
export const testCommand = `${__dirname}/tests/node_modules/.bin/${mainCommand}`;
if (!packageJson.version) {
	throw new Error("Package has no version number set.");
}
export const packageVersion = packageJson.version;

export function hasHelpFlag(args: string[]) {
	return !!args.find((arg) => arg === "--help" || arg === "-h");
}

export async function execute(
	command: string,
	options: { debug: boolean } = { debug: false },
) {
	return new Promise<{
		error: ExecException | null;
		stdout: string;
		stderr: string;
	}>((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				if (options.debug) {
					console.error({ error, stdout, stderr });
				}
				reject({ error, stdout, stderr });
			}
			resolve({ error, stdout, stderr });
		});
	});
}

export function toCamelCase(text: string) {
	return text.replace(
		/^([A-Z])|[\s-_](\w)/g,
		function (match, p1: string, p2: string) {
			if (p2) return p2.toUpperCase();
			return p1.toLowerCase();
		},
	);
}
