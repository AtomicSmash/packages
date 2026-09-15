import type { YargsInstance } from "../cli.js";
import type { ArgumentsCamelCase } from "yargs";
import { exec } from "node:child_process";
import {
	unlink as deleteFile,
	access,
	constants,
	stat,
} from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import { getSmashConfig } from "@atomicsmash/smash-config";
import { convertMeasureToPrettyString, startRunningMessage } from "../utils.js";
import { resolve } from "node:path";
import { select } from "@inquirer/prompts";

const execute = promisify(exec);

export const command = "pull-database";
export const describe =
	"Pull the database down from staging and replace local database.";
export const builder = function (yargs: YargsInstance) {
	return yargs
		.options({
			resume: {
				demandOption: false,
				boolean: true,
				description: "Resume the process from an existing database.",
				conflicts: "fresh",
			},
			fresh: {
				demandOption: false,
				boolean: true,
				description: "Clean up any previous runs before starting this run.",
				conflicts: "resume",
			},
		})
		.example("$0 svg --in icons --out public/assets", "");
};

export async function handler(
	args: ArgumentsCamelCase<Awaited<ReturnType<typeof builder>["argv"]>>,
) {
	const smashConfig = await getSmashConfig(2);
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
	const stagingDatabaseDownloadLocation = resolve(
		"/tmp",
		`${projectName}-staging-database.sql`,
	);

	let mode = args.fresh ? "fresh" : args.resume ? "resume" : "unknown";

	let hasLocalDatabaseFile = await access(
		stagingDatabaseDownloadLocation,
		constants.R_OK | constants.W_OK,
	)
		.then(() => true)
		.catch(() => false);

	if (mode === "resume" && !hasLocalDatabaseFile) {
		console.log(
			"Failed to find an existing database to resume this process from. Please try running this command without the --resume flag.",
		);
		return;
	}

	if (mode === "unknown") {
		if (hasLocalDatabaseFile) {
			console.log("We found an existing database download file.");
			const fileStats = await stat(stagingDatabaseDownloadLocation);
			const timestamp = new Date(fileStats.mtime).toLocaleString();
			const choice = await select({
				message:
					"Do you want to resume from the existing file or start a new download?",
				choices: [
					{ name: `Resume from existing file (${timestamp})`, value: "resume" },
					{ name: "Start new download", value: "fresh" },
				],
			});

			mode = choice;
		} else {
			mode = "fresh";
		}
	}

	performance.mark("Start");

	if (mode === "fresh" && hasLocalDatabaseFile) {
		await deleteFile(stagingDatabaseDownloadLocation).then(() => {
			hasLocalDatabaseFile = false;
			console.log("Cleaned up existing database file.");
		});
	}

	if (mode === "fresh") {
		const stopRunningMessage = startRunningMessage(
			"Pulling database from staging",
		);
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
			`ssh -o "StrictHostKeyChecking no" ${stagingSSHUsername}@${stagingSSHHost} ${port} "${stagingWebRoot !== "" ? `cd ${stagingWebRoot} && ` : ""} wp db export - --add-drop-table --exclude_tables=${tablesToExclude.join(",")}" > ${stagingDatabaseDownloadLocation}`,
		)
			.then(async () => {
				await stopRunningMessage();
				console.log("Database downloaded.");
			})
			.catch(async (error: unknown) => {
				await stopRunningMessage();
				console.error("Error during database pull:", error);

				await deleteFile(stagingDatabaseDownloadLocation).catch(() => {
					console.warn(
						`Warning: Failed to delete the local database file. This file is likely unfinished/corrupted. You may need to clean it up manually.`,
					);
				});

				process.exitCode = 1;
			});
	}

	// Check if a DB exists, and if it doesn't, create one using the details in wp-config.
	await execute(`wp db check`).catch(async () => {
		await execute(`wp db create`);
		console.log("Local database created.");
	});

	// Import downloaded database into the local DB
	const stopRunningMessage2 = startRunningMessage("Importing database");
	await execute(`wp db query < ${stagingDatabaseDownloadLocation}`)
		.then(async () => {
			await stopRunningMessage2();
			console.log("Database imported.");
		})
		.catch(async (error: unknown) => {
			await stopRunningMessage2();
			throw error;
		});

	// Run search and replace against the local DB (this is required to correctly update serialised values)
	const stopRunningMessage3 = startRunningMessage("Running search and replace");
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

	// Cleanup DB file on success
	const stopRunningMessage4 = startRunningMessage("Cleaning up");
	await deleteFile(stagingDatabaseDownloadLocation).then(async () => {
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
}
