import { exec } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import { startRunningMessage } from "../utils.js";
import type { SmashConfigV2Resolved } from "@atomicsmash/smash-config";
import { getSmashConfig } from "@atomicsmash/smash-config";

const execute = promisify(exec);

async function downloadFiles(
	remotePath: string,
	localPath: string,
	ssh: SmashConfigV2Resolved["staging"]["ssh"],
) {
	const port = ssh.port ? `-P ${ssh.port.toString()}` : ``;
	try {
		// Create local directory if it doesn't exist
		await mkdir(localPath, { recursive: true });

		// Download files using scp
		await execute(
			`scp -r -p -O -o "StrictHostKeyChecking no" ${port} "${ssh.username}@${ssh.host}:${remotePath}" "${localPath}"`,
		);
	} catch (error) {
		console.log(`Failed to download ${remotePath}`);
		if (typeof error === "object" && error && "stderr" in error) {
			console.error(error.stderr);
		}
		throw new Error("Error downloading media.");
	}
}

export const command = "pull-media";
export const describe = "Pull the media items from the staging site.";
export async function handler() {
	const {
		uploadsPath: uploadsPath,
		staging: {
			uploadsPath: stagingUploadsPath,
			webRoot: stagingWebRoot,
			ssh: stagingSSHDetails,
		},
		cli: {
			pullMedia: { monthsToPull },
		},
	} = await getSmashConfig(2);
	const mediaMonths = monthsToPull;
	const mediaServerPath = `${stagingWebRoot}/${stagingUploadsPath}`;
	const mediaLocalPath = uploadsPath;

	const stopRunningMessage = startRunningMessage("Pulling media from staging");
	performance.mark("Start");
	await (async () => {
		if (mediaMonths === -1) {
			console.log("Downloading entire uploads directory...");
			const localPath = resolve(mediaLocalPath, "..");

			console.log(
				`Downloading entire uploads directory: ${mediaServerPath} -> ${localPath}`,
			);
			await downloadFiles(mediaServerPath, localPath, stagingSSHDetails);
		} else {
			console.log(
				`Downloading media for the last ${mediaMonths.toString()} months...`,
			);
			// Download media for each month
			for (let i = 0; i < mediaMonths; i++) {
				const date = new Date();
				date.setMonth(date.getMonth() - i);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, "0");
				const remotePath = `${mediaServerPath}/${year.toString()}/${month}`;
				const localPath = `${mediaLocalPath}/${year.toString()}`;

				console.log(`Attempting to download: ${remotePath} -> ${localPath}`);
				try {
					await downloadFiles(remotePath, localPath, stagingSSHDetails);
				} catch {
					console.log(
						`Skipping uploads/${year.toString()}/${month} - directory does not exist on remote server`,
					);
					return; // Skip to next iteration
				}
			}
			console.log("Finished attempting to download all requested months");
		}
	})()
		.then(async () => {
			await stopRunningMessage();
			console.log("Media download complete!");
		})
		.catch(async () => {
			await stopRunningMessage();
			console.log(
				"There was an error downloading the media, see the message above.",
			);
			process.exitCode = 1;
		});
}
