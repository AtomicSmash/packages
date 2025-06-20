#!/usr/bin/env node
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
