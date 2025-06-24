import type { ExecException } from "node:child_process";
import type { PerformanceMeasure } from "node:perf_hooks";
import type { PackageJson } from "type-fest";
import { exec } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
export const packageJson = require("../package.json") as PackageJson;
if (packageJson.bin === undefined) {
	throw new Error("Script name is not defined.");
}
export const testCommand = `node ${resolve(`${import.meta.dirname}/../dist/index.js`)}`;
if (!packageJson.version) {
	throw new Error("Package has no version number set.");
}
export const packageVersion = packageJson.version;

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
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- This is preferred in this instance
				reject({ error, stdout, stderr });
			}
			resolve({ error, stdout, stderr });
		});
	});
}

export function toCamelCase(text: string) {
	return text.replace(
		/^([A-Z])|[\s-_](\w)/g,
		function (_match, p1: string, p2: string) {
			if (p2) return p2.toUpperCase();
			return p1.toLowerCase();
		},
	);
}

export function convertMeasureToPrettyString(measure: PerformanceMeasure) {
	const duration = Number(measure.duration);
	if (duration < 1) {
		return `${duration * 1000}µs`;
	}
	if (duration < 999) {
		return `${Math.round(duration)}ms`;
	}
	const timeInSeconds = Number((duration / 1000).toFixed(2));
	if (timeInSeconds < 60) {
		return `${timeInSeconds}s`;
	}
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.ceil(timeInSeconds % 60);
	return `${minutes}m ${seconds}s`;
}

export function startRunningMessage(message: string) {
	let $i = 3;
	process.stdout.write(`${message}${".".repeat($i)}\r`);
	$i++;
	if (typeof process.stdout.clearLine !== "undefined") {
		return setInterval(() => {
			if ($i > 2) {
				$i = 0;
			}
			$i++;
			process.stdout.clearLine(0);
			process.stdout.cursorTo(0);
			process.stdout.write(`${message}${".".repeat($i)}\r`);
		}, 200);
	}
	return null;
}
