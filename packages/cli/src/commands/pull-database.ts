import { exec } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { unlink as deleteFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import readline from "node:readline";
import { promisify } from "node:util";
import {
	convertMeasureToPrettyString,
	getSmashConfig,
	startRunningMessage,
} from "../utils.js";

export const command = "pull-database";
export const describe =
	"Pull the database down from staging and replace local database.";
export async function handler() {
	const execute = promisify(exec);
	const smashConfig = await getSmashConfig();
	const stagingSSHUsername = process.env.STAGING_SSH_USERNAME;
	const stagingSSHHost = process.env.STAGING_SSH_HOST;
	const stagingSSHPort = process.env.STAGING_SSH_PORT;
	const stagingUrl = process.env.STAGING_URL?.endsWith("/")
		? process.env.STAGING_URL.slice(0, -1)
		: process.env.STAGING_URL;
	if (!smashConfig) {
		throw new Error(
			"Unable to determine project setup information. Please add a smash.config.ts file with the required info.",
		);
	} else if (!stagingSSHUsername) {
		throw new Error("STAGING_SSH_USERNAME is missing from .env file.");
	} else if (!stagingSSHHost) {
		throw new Error("STAGING_SSH_HOST is missing from .env file.");
	} else if (!stagingSSHPort) {
		throw new Error("STAGING_SSH_PORT is missing from .env file.");
	} else if (!stagingUrl) {
		throw new Error("STAGING_URL is missing from .env file.");
	} else {
		const { themeName } = smashConfig;
		const stopRunningMessage = startRunningMessage(
			"Pulling database from staging",
		);
		performance.mark("Start");
		await (async () => {
			const tmpFile = "/tmp/staging-database.sql";
			const tmpFileProcessed = "/tmp/staging-database.processed.sql";
			await execute(
				`ssh ${stagingSSHUsername}@${stagingSSHHost} -p ${stagingSSHPort} "cd public/current && wp db export - --add-drop-table" > ${tmpFile}`,
			)
				.then(async () => {
					await stopRunningMessage();
					console.log("Database downloaded.");
					const stopRunningMessage2 = startRunningMessage(
						"Updating URLs in database SQL",
					);
					await new Promise<void>((resolve, reject) => {
						const readStream = createReadStream(tmpFile, { encoding: "utf8" });
						const writeStream = createWriteStream(tmpFileProcessed, {
							encoding: "utf8",
						});

						const rl = readline.createInterface({ input: readStream });

						rl.on("line", (line) => {
							writeStream.write(
								line.replaceAll(stagingUrl, `//${themeName}.test`) + "\n",
							);
						});

						rl.on("close", () => {
							writeStream.end();
						});

						writeStream.on("finish", resolve);
						writeStream.on("error", reject);
						readStream.on("error", reject);
					})
						.then(async () => {
							await stopRunningMessage2();
							console.log("URLs updated.");
						})
						.catch(async (error) => {
							await stopRunningMessage2();
							throw error;
						});
				})
				.then(async () => {
					const stopRunningMessage3 = startRunningMessage("Importing database");
					await execute(`wp db query < ${tmpFileProcessed}`)
						.then(async () => {
							await stopRunningMessage3();
						})
						.catch(async (error) => {
							await stopRunningMessage3();
							throw error;
						});
					const stopRunningMessage4 = startRunningMessage("Cleaning up");
					await Promise.allSettled([
						deleteFile(tmpFile),
						deleteFile(tmpFileProcessed),
					]).then(async () => {
						await stopRunningMessage4();
					});

					console.log(
						`Database import complete! ${convertMeasureToPrettyString(
							performance.measure("everything", "Start"),
						)}`,
					);
					console.log(
						"If you want to download recent media you can use `npm run pull:media`, you can also change the number of months to download in your `.env` file.",
					);
				})
				.catch(async (error) => {
					await stopRunningMessage();
					console.error("Error during database pull:", error);

					const cleanupResults = await Promise.allSettled([
						deleteFile(tmpFile),
						deleteFile(tmpFileProcessed),
					]);

					const failedCleanups = cleanupResults.filter(
						(result) => result.status === "rejected",
					);
					if (failedCleanups.length > 0) {
						console.warn(
							`Warning: Failed to delete ${failedCleanups.length} temporary file(s). You may need to clean them up manually.`,
						);
					}
				});
		})();
	}
}
