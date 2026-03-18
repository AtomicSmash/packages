import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { getSmashConfig } from "@atomicsmash/smash-config";

const PROXY_MARKER = "location @uploadsproxy";

function buildProxyBlock(stagingUrl: string) {
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

export const command = "add-media-proxy";
export const describe =
	"Update the local NGINX config within Herd to add a media proxy.";
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

	if (config.includes(PROXY_MARKER)) {
		console.log("Media proxy block already exists in NGINX config. Nothing to do.");
		return;
	}

	// Find the SSL server block by locating the listen directive.
	const listenDirective = "listen 127.0.0.1:443 ssl;";
	const listenIndex = config.indexOf(listenDirective);
	if (listenIndex === -1) {
		throw new Error(
			"Could not locate the SSL server block (listen 127.0.0.1:443 ssl;) in the NGINX config.",
		);
	}

	// The Herd-generated config has intentionally unclosed nested location blocks,
	// so brace counting won't work. Instead, find the boundary of this server block
	// by looking for the next top-level `server {` after the listen directive
	// (or end of file), then scan backwards for the last `}` before that boundary.
	const nextServerBlockIndex = config.indexOf("\nserver", listenIndex);
	const searchUpTo =
		nextServerBlockIndex !== -1 ? nextServerBlockIndex : config.length;

	const serverBlockEnd = config.lastIndexOf("}", searchUpTo);
	if (serverBlockEnd === -1 || serverBlockEnd < listenIndex) {
		throw new Error("Could not locate the closing brace of the SSL server block.");
	}

	const proxyBlock = buildProxyBlock(stagingUrl);
	const updatedConfig =
		config.slice(0, serverBlockEnd) +
		proxyBlock +
		"\n" +
		config.slice(serverBlockEnd);

	await writeFile(nginxConfigPath, updatedConfig, "utf-8");
	console.log(`Media proxy added to ${nginxConfigPath}`);
	console.log("Run `herd restart` or restart Herd via the UI for the changes to take effect.");
}
