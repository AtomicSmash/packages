import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { getSmashConfig } from "@atomicsmash/smash-config";

export const PROXY_MARKER = "location @uploadsproxy";

export function buildProxyBlock(stagingUrl: string) {
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
        proxy_set_header User-Agent "Mozilla/5.0";
    }`;
}

export function addProxyBlock(config: string, stagingUrl: string): string {
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
		buildProxyBlock(stagingUrl) +
		"\n" +
		config.slice(serverBlockEnd)
	);
}

export function removeProxyBlock(config: string): string {
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

	const stagingUrl = process.env.STAGING_URL?.endsWith("/")
		? process.env.STAGING_URL.slice(0, -1)
		: process.env.STAGING_URL;

	if (!stagingUrl) {
		throw new Error("STAGING_URL is missing from .env file.");
	}

	const { projectName } = smashConfig;
	const nginxConfigPath = join(
		homedir(),
		"Library/Application Support/Herd/config/valet/Nginx",
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

	let updatedConfig: string;

	if (config.includes(PROXY_MARKER)) {
		updatedConfig = removeProxyBlock(config);
		console.log("Media proxy removed from NGINX config.");
	} else {
		updatedConfig = addProxyBlock(config, stagingUrl);
		console.log("Media proxy added to NGINX config.");
	}

	await writeFile(nginxConfigPath, updatedConfig, "utf-8");
	console.log(
		"Run `herd restart` or restart Herd via the UI for the changes to take effect.",
	);
}
