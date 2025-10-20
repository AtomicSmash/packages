import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import {
	constants,
	copyFile,
	unlink as deleteFile,
	mkdir,
} from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import {
	convertMeasureToPrettyString,
	getSmashConfig,
	startRunningMessage,
} from "../utils.js";

export const command = "setup";
export const describe = "Run all the common setup tasks for a project.";
export async function handler() {
	const execute = promisify(exec);
	const shouldInstallAndBuildOnly = await import("dotenv")
		.then((dotenv) => {
			dotenv.config();
			return process.env.SETUP_INSTALL_AND_BUILD_ONLY?.toLowerCase() === "true";
		})
		.catch(() => {
			return false;
		});
	const smashConfig = await getSmashConfig();
	if (!smashConfig) {
		throw new Error(
			"Unable to determine project setup information. Please add a smash.config.ts file with the required info.",
		);
	} else {
		const { projectName, composerInstallPaths, npmInstallPaths } = smashConfig;
		const stopRunningMessage = startRunningMessage("Running setup");
		performance.mark("Start");
		await Promise.allSettled([
			...(shouldInstallAndBuildOnly
				? []
				: [
						(async () => {
							if (existsSync(".env.example")) {
								if (existsSync(".config/environments/.env.dev")) {
									throw new Error(
										"Both .env.example and .config/environments/.env.dev files found. Please copy values from the .env.example to the .config/environments/.env.dev file and then delete the .env.example file.",
									);
								} else {
									console.log(
										"Moving .env.example to .config/environments/.env.dev",
									);
									if (!existsSync(".config/environments")) {
										await mkdir(".config/environments", { recursive: true });
									}
									await copyFile(
										".env.example",
										".config/environments/.env.dev",
										constants.COPYFILE_EXCL,
									);
									await deleteFile(".env.example");
								}
							}
							await copyFile(
								".config/environments/.env.dev",
								".env",
								constants.COPYFILE_EXCL,
							)
								.then(() => {
									console.log(
										`.config/environments/.env.dev file copied to .env. (${convertMeasureToPrettyString(
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
								});
						})(),
						(async () => {
							if (
								await execute(`herd --version`)
									.then(() => true)
									.catch(() => false)
							) {
								if (
									!existsSync(resolve(process.cwd(), "herd.yaml")) &&
									!existsSync(resolve(process.cwd(), "herd.yml"))
								) {
									throw new Error(
										"Herd is present on your machine, but the project is missing a herd.yaml file. Please do the initial setup by running herd init.",
									);
								}
								await execute(`herd init`)
									.then(() => {
										performance.mark("herd init done");
										console.log(
											`Herd is configured. (${convertMeasureToPrettyString(
												performance.measure("herd-or-valet", "Start"),
											)})`,
										);
									})
									.catch((error) => {
										console.error(error);
										throw new Error("Failed to configure the site using Herd.");
									});
								await execute(`herd link ${projectName} --secure`)
									.then(() => {
										performance.mark("herd link done");
										console.log(
											`Herd is linked and secured. (${convertMeasureToPrettyString(
												performance.measure("herd link", "herd init done"),
											)})`,
										);
									})
									.catch((error) => {
										console.error(error);
										throw new Error("Failed to link the site using Herd.");
									});
								await execute(`herd isolate`)
									.then(() => {
										console.log(
											`Herd is isolated. (${convertMeasureToPrettyString(
												performance.measure("herd isolate", "herd link done"),
											)})`,
										);
									})
									.catch((error) => {
										console.error(error);
										throw new Error("Failed to isolate the site using Herd.");
									});
							} else if (
								await execute(`valet --version`)
									.then(() => true)
									.catch(() => false)
							) {
								await execute(`valet link ${projectName} --secure --isolate`)
									.then(() => {
										console.log(
											`Valet is linked, secured and isolated. (${convertMeasureToPrettyString(
												performance.measure("herd-or-valet", "Start"),
											)})`,
										);
									})
									.catch((error) => {
										console.error(error);
										throw new Error("Failed to link the site using valet.");
									});
							} else {
								throw new Error(
									`Neither Herd nor Valet is present on your machine, check everything is installed correctly.`,
								);
							}
						})(),
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
			...(composerInstallPaths?.map((path, index) => {
				return execute(`cd "${resolve(process.cwd(), path)}"; composer install`)
					.then(() => {
						console.log(
							`Additional composer install ${index + 1} done. (${convertMeasureToPrettyString(
								performance.measure(
									`additional composer install ${index + 1}`,
									"Start",
								),
							)})`,
						);
					})
					.catch((error) => {
						console.error(error);
						throw new Error(
							`Failed to run additional composer install ${index + 1}.`,
						);
					});
			}) ?? []),
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
			...(npmInstallPaths?.map((path, index) => {
				return execute(`cd "${resolve(process.cwd(), path)}"; npm install`)
					.then(() => {
						console.log(
							`Additional npm install ${index + 1} done. (${convertMeasureToPrettyString(
								performance.measure(
									`additional npm install ${index + 1}`,
									"Start",
								),
							)})`,
						);
					})
					.catch((error) => {
						console.error(error);
						throw new Error(
							`Failed to run additional npm install ${index + 1}.`,
						);
					});
			}) ?? []),
		]).then(async (results) => {
			await stopRunningMessage();
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
