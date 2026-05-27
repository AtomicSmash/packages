import { exec } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { homedir, type } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { getSmashConfig } from "@atomicsmash/smash-config";


const PROXY_MARKER = "location @uploadsproxy";
const isWindows = type() === "Darwin";
const execute = promisify(exec);

function buildProxyBlock(stagingUrl: string, httpAuth?: string) {
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
        proxy_pass https:${stagingUrl}$uri$is_args$args;
        proxy_ssl_verify off;
        proxy_set_header Referer "";
        proxy_set_header User-Agent "Mozilla/5.0";${authHeader}
    }`;
}

function addProxyBlock(config: string, stagingUrl: string, httpAuth?: string): string {
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
		buildProxyBlock(stagingUrl, httpAuth) +
		"\n" +
		config.slice(serverBlockEnd)
	);
}

function removeProxyBlock(config: string): string {
	return config.replace(
		/\n\s*location \^~ \/wp-content\/uploads\/\s*\{[\s\S]*?location @uploadsproxy\s*\{[\s\S]*?\}/,
		"",
	);
}

export const command = "toggle-media-proxy";
export const describe =
	"Toggle the media proxy in the local NGINX config within Herd.";

export async function handler() {
	const smashConfig = await getSmashConfig();
	if (!smashConfig) {
		throw new Error(
			"Unable to determine project setup information. Please add a smash.config.ts file with the required info.",
		);
	}

	const stagingUrl = smashConfig.staging.url ?
		smashConfig.staging.url.endsWith("/")
			? smashConfig.staging.url.slice(0, -1)
			: smashConfig.staging.url
		: undefined;

	if (!stagingUrl) {
		throw new Error("staging.url is missing from the smash config");
	}

	const { projectName } = smashConfig;
	const nginxConfigPath = join(
		homedir(),
		isWindows ? "Library/Application Support/Herd/config/valet/Nginx" : ".config\\herd\\config\\nginx",
		`${projectName}.test`,
	);

	let config: string;
	try {
		config = await readFile(nginxConfigPath, "utf-8");
	} catch {
		throw new Error(
			`Could not read NGINX config at: ${nginxConfigPath}\nMake sure the site exists in Herd.`,
		);
	}

	const httpAuthUsername = smashConfig.staging.httpAuth.username;
	const httpAuthPassword = smashConfig.staging.httpAuth.password;

	const httpAuth =
		httpAuthUsername && httpAuthPassword
			? Buffer.from(`${httpAuthUsername}:${httpAuthPassword}`).toString("base64")
			: undefined;

	let updatedConfig: string;

	if (config.includes(PROXY_MARKER)) {
		updatedConfig = removeProxyBlock(config);
		console.log("Media proxy removed from NGINX config.");
	} else {
		updatedConfig = addProxyBlock(config, stagingUrl, httpAuth);
		if (httpAuth) {
			console.log("Media proxy added to NGINX config (with HTTP auth).");
		} else {
			console.log(
				"Media proxy added to NGINX config (no HTTP auth — STAGING_HTTP_AUTH_USERNAME and STAGING_HTTP_AUTH_PASSWORD not set).",
			);
		}
	}

	await writeFile(nginxConfigPath, updatedConfig, "utf-8");

	console.log("Restarting Herd...");
	await execute("herd restart")
		.then(() => {
			console.log("Herd restarted successfully.");
		})
		.catch(() => {
			console.log("Failed to restart Herd automatically.")
		});
}

