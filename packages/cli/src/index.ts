#!/usr/bin/env node
import type { PackageJson } from "type-fest";
import { createRequire } from "node:module";
import { helpMessage, noCommandFound } from "./messages.js";
const hasDebugFlag = process.argv.find((arg) => arg === "--debug");

const commandArg = process.argv[2];
const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as PackageJson;
if (packageJson.bin === undefined) {
	throw new Error("Script name is not defined.");
}

switch (commandArg) {
	case undefined:
	case "--help":
	case "-h":
		console.log(helpMessage);
		break;
	case "--version":
	case "-v":
		console.log(packageJson.version);
		break;
	case "svg":
	case "blocks":
	case "setup":
	case "setup-database":
		try {
			await import(`./commands/${commandArg}.js`).then(
				async (module: { default(args: string[]): void | Promise<void> }) =>
					await module.default(process.argv.slice(3)),
			);
		} catch (error: unknown) {
			if (error instanceof Error) {
				if (error.message !== "") {
					console.error("Error: " + error.message);
				}
				if (hasDebugFlag) {
					console.error(error);
				}
			} else {
				throw error;
			}
			process.exitCode = 1;
		}
		break;

	default:
		console.error(noCommandFound);
		process.exitCode = 1;
		break;
}
