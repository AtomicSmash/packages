import { exec } from "node:child_process";
import { constants, copyFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import { hasHelpFlag } from "../utils.js";

export const setupHelpMessage = `
  Atomic Smash CLI - Setup command.

  Run all the common setup tasks for a project.

  Example usage:
    $ smash-cli setup
`;

function convertMeasureToPrettyString(
	measure: ReturnType<typeof performance.measure>,
) {
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

export default async function setup(args: string[]) {
	if (hasHelpFlag(args)) {
		console.log(setupHelpMessage);
		return;
	}
	const execute = promisify(exec);
	const themeName = process.env.npm_package_config_theme_name;
	const shouldInstallAndBuildOnly = await import("dotenv")
		.then((dotenv) => {
			dotenv.config();
			return process.env.SETUP_INSTALL_AND_BUILD_ONLY?.toLowerCase() === "true";
		})
		.catch(() => {
			return false;
		});

	if (!themeName) {
		throw new Error("Theme name is missing from package.json config object.");
	} else {
		let $i = 3;
		process.stdout.write(`Running setup${".".repeat($i)}\r`);
		$i++;
		let interval = null;
		if (typeof process.stdout.clearLine !== "undefined") {
			interval = setInterval(() => {
				if ($i > 2) {
					$i = 0;
				}
				$i++;
				process.stdout.clearLine(0);
				process.stdout.cursorTo(0);
				process.stdout.write(`Running setup${".".repeat($i)}\r`);
			}, 200);
		}
		performance.mark("Start");
		await Promise.allSettled([
			...(shouldInstallAndBuildOnly
				? []
				: [
						copyFile(".env.example", ".env", constants.COPYFILE_EXCL)
							.then(() => {
								console.log(
									`.env.example file copied to .env. (${convertMeasureToPrettyString(
										performance.measure("Copy env file", "Start"),
									)})`,
								);
							})
							.catch((error) => {
								if (
									error instanceof Error &&
									"code" in error &&
									error.code === "EEXIST"
								) {
									console.log(
										`Didn't copy .env file because one already exists. (${convertMeasureToPrettyString(
											performance.measure("Copy env file", "Start"),
										)})`,
									);
									return;
								}
								console.error(error);
								throw new Error("Failed to copy .env file.");
							}),
						execute(`valet link ${themeName} --secure --isolate`)
							.then(() => {
								console.log(
									`Valet is linked, secured and isolated. (${convertMeasureToPrettyString(
										performance.measure("valet", "Start"),
									)})`,
								);
							})
							.catch((error) => {
								console.error(error);
								throw new Error("Failed to link the site using valet.");
							}),
					]),
			execute("composer install")
				.then(() => {
					console.log(
						`Root composer install done. (${convertMeasureToPrettyString(
							performance.measure("root composer install", "Start"),
						)})`,
					);
				})
				.catch((error) => {
					console.error(error);
					throw new Error(
						"Failed to run composer install in the root directory.",
					);
				}),
			(async () => {
				await execute("npm install")
					.then(() => {
						performance.mark("root npm install done");
						console.log(
							`Root npm install done. (${convertMeasureToPrettyString(
								performance.measure("root npm install", "Start"),
							)})`,
						);
					})
					.catch((error) => {
						console.error(error);
						throw new Error("Failed to run npm install in the root directory.");
					});
				await execute("npm run build")
					.then(() => {
						console.log(
							`Initial build done. (${convertMeasureToPrettyString(
								performance.measure("build", "root npm install done"),
							)})`,
						);
					})
					.catch((error) => {
						console.error(error);
						throw new Error("Failed to run a build after installing.");
					});
			})().catch((reason: string) => {
				throw new Error(reason);
			}),
		]).then((results) => {
			if (interval !== null) {
				clearInterval(interval);
			}
			if (results.some((result) => result.status === "rejected")) {
				process.exitCode = 1;
				console.error("Setup failed with the following errors:\n");
				console.error(
					results
						.filter((result) => result.status === "rejected")
						.map((result) => {
							return `- ${result.reason}`;
						})
						.join(`\n`),
				);
			} else {
				console.log(
					`Setup is complete. ${convertMeasureToPrettyString(
						performance.measure("everything", "Start"),
					)}`,
				);
			}
		});
	}
}
