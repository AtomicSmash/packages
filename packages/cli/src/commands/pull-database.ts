import { exec } from "node:child_process";
import { unlink as deleteFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import { getSmashConfig } from "@atomicsmash/smash-config";
import {
	confirmAction,
	convertMeasureToPrettyString,
	startRunningMessage,
} from "../utils.js";

export const command = "pull-database";
export const describe =
	"Pull the database down from staging and replace local database.";

export async function handler() {
	const execute = promisify(exec);
	const smashConfig = await getSmashConfig(2);

	const isConfirmed = await confirmAction(
		"This will overwrite your local database with the staging database. Are you sure? (y/n) ",
	);
	if (!isConfirmed) {
		console.log("Aborted. No database changes made");
		return;
	}

	const {
		projectName,
		staging: {
			url: stagingURL,
			dbPrefix: stagingDBPrefix,
			webRoot: stagingWebRoot,
			ssh: {
				username: stagingSSHUsername,
				host: stagingSSHHost,
				port: stagingSSHPort,
			},
		},
		cli: {
			pullMedia: { monthsToPull },
		},
	} = smashConfig;

	const stopRunningMessage = startRunningMessage(
		"Pulling database from staging",
	);

	performance.mark("Start");
	await (async () => {
		const tmpFile = "/tmp/staging-database.sql";
		const dbPrefixFile = "/tmp/db-prefix.txt";
		const tablesToExclude = [
			// WordFence
			"wfauditevents",
			"wfblockediplog",
			"wfblocks7",
			"wfconfig",
			"wfcrawlers",
			"wffilemods",
			"wfhits",
			"wfhoover",
			"wfissues",
			"wfknownfilelist",
			"wflivetraffichuman",
			"wflocs",
			"wflogins",
			"wfls_2fa_secrets",
			"wfls_role_counts",
			"wfls_settings",
			"wfnotifications",
			"wfpendingissues",
			"wfreversecache",
			"wfsecurityevents",
			"wfsnipcache",
			"wfstatus",
			"wftrafficrates",
			"wfwaffailures",
			// WP All Import/Export
			"pmxi_files",
			"pmxi_geocoding",
			"pmxi_hash",
			"pmxi_history",
			"pmxi_images",
			"pmxi_imports",
			"pmxi_posts",
			"pmxi_templates",
		].map((tableName) => stagingDBPrefix + tableName);

		const port = stagingSSHPort ? `-p ${stagingSSHPort.toString()}` : ``;
		await execute(
			`ssh -o "StrictHostKeyChecking no" ${stagingSSHUsername}@${stagingSSHHost} ${port} "${stagingWebRoot !== "" ? `cd ${stagingWebRoot} && ` : ""} wp db export - --add-drop-table --exclude_tables=${tablesToExclude.join(",")}" > ${tmpFile}`,
		)
			.then(async () => {
				await stopRunningMessage();
				console.log("Database downloaded.");
				await execute(`wp db check`).catch(async () => {
					await execute(`wp db create`);
					console.log("Local database created.");
				});
				const stopRunningMessage2 = startRunningMessage("Importing database");
				await execute(`wp db query < ${tmpFile}`)
					.then(async () => {
						await stopRunningMessage2();
						console.log("Database imported.");
					})
					.catch(async (error: unknown) => {
						await stopRunningMessage2();
						throw error;
					});
			})
			.then(async () => {
				const stopRunningMessage3 = startRunningMessage(
					"Running search and replace",
				);

				await execute(
					`wp search-replace --url=${projectName}.test //${stagingURL} '//${projectName}.test'`,
				)
					.then(async () => {
						await stopRunningMessage3();
						console.log("Search and replace completed.");
					})
					.catch(async (error: unknown) => {
						await stopRunningMessage3();
						throw error;
					});
			})
			.then(async () => {
				const stopRunningMessage4 = startRunningMessage("Cleaning up");
				await Promise.allSettled([
					deleteFile(tmpFile),
					deleteFile(dbPrefixFile),
				]).then(async () => {
					await stopRunningMessage4();
				});

				console.log(
					`Database import complete! ${convertMeasureToPrettyString(
						performance.measure("everything", "Start"),
					)}`,
				);
				console.log(
					`If you're using Herd, you can now run the proxy-media command to avoid having to download images.
Otherwise, you can use pull:media for a slow download of ${monthsToPull === -1 ? "all the images" : `${monthsToPull.toString()} months worth of images`} from staging.`,
				);
			})
			.catch(async (error: unknown) => {
				await stopRunningMessage();
				console.error("Error during database pull:", error);

				const cleanupResults = await Promise.allSettled([
					deleteFile(tmpFile),
					deleteFile(dbPrefixFile),
				]);

				const failedCleanups = cleanupResults.filter(
					(result) => result.status === "rejected",
				);
				if (failedCleanups.length > 0) {
					console.warn(
						`Warning: Failed to delete ${failedCleanups.length.toString()} temporary file(s). You may need to clean them up manually.`,
					);
				}
				process.exitCode = 1;
			});
	})();
}
