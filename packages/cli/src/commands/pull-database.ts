import { exec } from "node:child_process";
import { unlink as deleteFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import {
	getConfigs,
	getSmashConfig,
	getStagingUrl,
} from "@atomicsmash/smash-config";
import { convertMeasureToPrettyString, startRunningMessage } from "../utils.js";

export const command = "pull-database";
export const describe =
	"Pull the database down from staging and replace local database.";

export async function handler() {
	const execute = promisify(exec);
	const smashConfig = await getSmashConfig();

	if (!smashConfig) {
		throw new Error(
			"Unable to determine project setup information. Please add a smash.config.ts file with the required info.",
		);
	}
	const [
		stagingSSHUsername,
		stagingSSHHost,
		stagingSSHPort,
		stagingDBPrefix,
		stagingWebRoot,
	] = getConfigs(smashConfig, [
		"staging.ssh.username",
		"staging.ssh.host",
		"staging.ssh.port",
		"staging.dbPrefix",
		"staging.webRoot",
	]);

	const stagingUrl = getStagingUrl(smashConfig);

	const { projectName } = smashConfig;
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
		await execute(
			`ssh -o "StrictHostKeyChecking no" ${stagingSSHUsername}@${stagingSSHHost} -p ${stagingSSHPort} "${stagingWebRoot !== "" ? `cd ${stagingWebRoot} && ` : ""}wp db export - --add-drop-table --exclude_tables=${tablesToExclude.join(",")}" > ${tmpFile}`,
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
					.catch(async (error) => {
						await stopRunningMessage2();
						throw error;
					});
			})
			.then(async () => {
				const stopRunningMessage3 = startRunningMessage(
					"Running search and replace",
				);

				const composeStagingUrl = stagingUrl
					.replace(/^https?:\/\//, "")
					.replace(/^www\./, "");

				await execute(
					`wp search-replace --url=${projectName}.test //${composeStagingUrl} '//${projectName}.test' --skip-columns=guid`,
				)
					.then(async () => {
						await stopRunningMessage3();
						console.log("Search and replace completed.");
					})
					.catch(async (error) => {
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
					"If you want to download recent media you can use `npm run pull:media`, you can also change the number of months to download in your `.env` file.",
				);
			})
			.catch(async (error) => {
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
						`Warning: Failed to delete ${failedCleanups.length} temporary file(s). You may need to clean them up manually.`,
					);
				}
				process.exitCode = 1;
			});
	})();
}
