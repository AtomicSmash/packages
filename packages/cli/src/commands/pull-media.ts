import { exec } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import { startRunningMessage } from "../utils.js";

const execute = promisify(exec);

async function downloadFiles(
	remotePath: string,
	localPath: string,
	ssh: {
		port: string;
		username: string;
		host: string;
	},
) {
	try {
		// Create local directory if it doesn't exist
		await mkdir(localPath, { recursive: true });

		// Download files using scp
		await execute(
			`scp -r -p -O -o "StrictHostKeyChecking no" -P ${ssh.port} "${ssh.username}@${ssh.host}:${remotePath}" "${localPath}"`,
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
	const stagingSSHUsername = process.env.STAGING_SSH_USERNAME;
	const stagingSSHHost = process.env.STAGING_SSH_HOST;
	const stagingSSHPort = process.env.STAGING_SSH_PORT;
	const stagingUrl = process.env.STAGING_URL?.endsWith("/")
		? process.env.STAGING_URL.slice(0, -1)
		: process.env.STAGING_URL;
	const mediaMonths = parseInt(process.env.MEDIA_DOWNLOAD_MONTHS ?? "-1");
	const mediaPath = process.env.MEDIA_DOWNLOAD_PATH;
	const mediaLocalPath = process.env.MEDIA_DOWNLOAD_LOCAL_PATH;
	if (!stagingSSHUsername) {
		throw new Error("STAGING_SSH_USERNAME is missing from .env file.");
	} else if (!stagingSSHHost) {
		throw new Error("STAGING_SSH_HOST is missing from .env file.");
	} else if (!stagingSSHPort) {
		throw new Error("STAGING_SSH_PORT is missing from .env file.");
	} else if (!stagingUrl) {
		throw new Error("STAGING_URL is missing from .env file.");
	} else if (!mediaPath) {
		throw new Error("MEDIA_DOWNLOAD_PATH is missing from .env file.");
	} else if (!mediaLocalPath) {
		throw new Error("MEDIA_DOWNLOAD_LOCAL_PATH is missing from .env file.");
	} else {
		const ssh = {
			port: stagingSSHPort,
			host: stagingSSHHost,
			username: stagingSSHUsername,
		};
		const stopRunningMessage = startRunningMessage(
			"Pulling media from staging",
		);
		performance.mark("Start");
		await (async () => {
			if (mediaMonths === -1) {
				console.log("Downloading entire uploads directory...");
				const localPath = resolve(mediaLocalPath, "..");

				console.log(
					`Downloading entire uploads directory: ${mediaPath} -> ${localPath}`,
				);
				await downloadFiles(mediaPath, localPath, ssh);
			} else {
				console.log(`Downloading media for the last ${mediaMonths} months...`);
				// Download media for each month
				for (let i = 0; i < mediaMonths; i++) {
					const date = new Date();
					date.setMonth(date.getMonth() - i);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, "0");
					const remotePath = `${mediaPath}/${year}/${month}`;
					const localPath = `${mediaLocalPath}/${year}`;

					console.log(`Attempting to download: ${remotePath} -> ${localPath}`);
					try {
						await downloadFiles(remotePath, localPath, ssh);
					} catch {
						console.log(
							`Skipping uploads/${year}/${month} - directory does not exist on remote server`,
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
			});
	}
}
