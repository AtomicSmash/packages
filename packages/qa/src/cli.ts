#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const yargsInstance = yargs(hideBin(process.argv));

await yargsInstance
	.scriptName("smash-qa")
	.commandDir("./commands")
	.demandCommand(1, "You must specify a command.")
	.showHelpOnFail(false, "Specify --help to see the available commands.")
	.wrap(yargsInstance.terminalWidth())
	.help()
	.alias("h", "help")
	.version()
	.alias("v", "version")
	.strict(true)
	.parse();
