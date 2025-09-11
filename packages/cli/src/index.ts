#!/usr/bin/env node
import { Options } from "sass";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const yargsInstance = yargs(hideBin(process.argv));
export type YargsInstance = typeof yargsInstance;

await yargsInstance
	.scriptName("smash-cli")
	.commandDir("./commands")
	.demandCommand(1, "You must specify a command.")
	.showHelpOnFail(false, "Specify --help to see the available commands.")
	.wrap(yargsInstance.terminalWidth())
	.completion()
	.help()
	.alias("h", "help")
	.version()
	.alias("v", "version")
	.strict(true)
	.parse();

export type SCSSAliases = {
	loadPaths?: Options<"async">["loadPaths"];
	importers?: Options<"async">["importers"];
};

export type SmashConfig = {
	themeName: string;
	themePath: string;
	npmInstallPaths?: string[];
	composerInstallPaths?: string[];
	scssAliases?: SCSSAliases;
};
