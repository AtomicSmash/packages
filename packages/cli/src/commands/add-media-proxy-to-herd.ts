import { exec } from "node:child_process";
import { promisify } from "node:util";
import { getSmashConfig } from "@atomicsmash/smash-config";
import { homedir, type } from "node:os";
import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";

const PROXY_MARKER = "location @uploadsproxy";

function buildProxyBlock(stagingURL: string, httpAuth?: string) {
	const authHeader = httpAuth
		? `\n        proxy_set_header Authorization "Basic ${httpAuth}";`
		: "";
	return `
    location ^~ /wp-content/uploads/ {
        try_files $uri @uploadsproxy;
    }

    location @uploadsproxy {
        resolver 8.8.8.8 ipv6=off;
        resolver_timeout 10s;
        proxy_http_version 1.1;
        proxy_ssl_server_name on;
        proxy_pass https://${stagingURL}$uri$is_args$args;
        proxy_ssl_verify off;
        proxy_set_header Referer "";
        proxy_set_header User-Agent "Mozilla/5.0";${authHeader}
    }`;
}

function addProxyBlock(
	config: string,
	stagingURL: string,
	httpAuth?: string,
): string {
	const listenDirective = "listen 127.0.0.1:443 ssl;";
	const listenIndex = config.indexOf(listenDirective);
	if (listenIndex === -1) {
		throw new Error(
			"Could not locate the SSL server block (listen 127.0.0.1:443 ssl;) in the NGINX config.",
		);
	}

	const nextServerBlockIndex = config.indexOf("\nserver", listenIndex);
	const searchUpTo =
		nextServerBlockIndex !== -1 ? nextServerBlockIndex : config.length;

	const serverBlockEnd = config.lastIndexOf("}", searchUpTo);
	if (serverBlockEnd === -1 || serverBlockEnd < listenIndex) {
		throw new Error(
			"Could not locate the closing brace of the SSL server block.",
		);
	}

	return (
		config.slice(0, serverBlockEnd) +
		buildProxyBlock(stagingURL, httpAuth) +
		"\n" +
		config.slice(serverBlockEnd)
	);
}

function getNginxConfigPath(projectName: string) {
	const isMacOS = type() === "Darwin";

	return join(
		homedir(),
		isMacOS
			? "Library/Application Support/Herd/config/valet/Nginx"
			: ".config\\herd\\config\\nginx",
		`${projectName}.test`,
	);
}

async function getNginxConfig(projectName: string) {
	const nginxConfigPath = getNginxConfigPath(projectName);
	try {
		return await readFile(nginxConfigPath, "utf-8");
	} catch {
		throw new Error(
			`Could not read NGINX config at: ${nginxConfigPath}\nMake sure the site exists in Herd.`,
		);
	}
}

async function updateNginxConfig(projectName: string, updatedConfig: string) {
	const nginxConfigPath = getNginxConfigPath(projectName);

	await writeFile(nginxConfigPath, updatedConfig, "utf-8");
}

const execute = promisify(exec);

export const command = "add-media-proxy-to-herd";
export const describe =
	"Add the media proxy to the local NGINX config within Herd.";

export async function handler() {
	const smashConfig = await getSmashConfig(2);

	const {
		projectName,
		staging: { url: stagingURL, httpAuth: stagingHttpAuth },
	} = smashConfig;

	const nginxConfig = await getNginxConfig(projectName);

	if (nginxConfig.includes(PROXY_MARKER)) {
		console.log(
			"Media proxy is already set up in your NGINX config. To remove please delete the site in Herd, remove your .env file and re-run setup.",
		);
		return;
	}

	const httpAuth = stagingHttpAuth
		? Buffer.from(
				`${stagingHttpAuth.username}:${stagingHttpAuth.password}`,
			).toString("base64")
		: undefined;

	const updatedConfig = addProxyBlock(nginxConfig, stagingURL, httpAuth);

	await updateNginxConfig(projectName, updatedConfig)
		.then(() => {
			if (httpAuth) {
				console.log("Media proxy added to NGINX config (with HTTP auth).");
			} else {
				console.log(
					"Media proxy added to NGINX config (no HTTP auth — httpAuth not set in smash.config.ts).",
				);
			}
		})
		.catch(() => {
			console.log(
				"Failed to update your NGINX config. Please try running the command again.",
			);
		});

	console.log("Restarting Herd...");
	await execute("herd restart")
		.then(() => {
			console.log("Herd restarted successfully.");
		})
		.catch(() => {
			console.log("Failed to restart Herd automatically.");
		});
}
