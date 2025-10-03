#!/usr/bin/env node
// import type { Configuration } from "webpack";
// import { cosmiconfig } from "cosmiconfig";
import webpack from "webpack";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { config as defaultConfig } from "./config.js";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace -- Match NodeJS def
	namespace NodeJS {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Match NodeJS def
		interface ProcessEnv {
			NODE_ENV: "production" | "development" | "test" | undefined;
		}
	}
}

const argv = await yargs(hideBin(process.argv))
	.options({
		in: {
			describe:
				"The directory where the source files can be found. Relative to cwd.",
			type: "string",
		},
		out: {
			describe:
				"The directory where the compiled files will out output. Relative to cwd.",
			type: "string",
		},
		watch: {
			boolean: true,
			default: false,
			describe:
				"Whether to watch the files in the source folder for changes and compile.",
		},
		analyse: {
			boolean: true,
			default: false,
			describe: "See a report of the generated bundle once built.",
		},
		experimentalBlocksSupport: {
			boolean: true,
			default: false,
			describe: "Enable experimental support for WordPress blocks compilation.",
			deprecate:
				"Blocks support is enabled by default now. You can remove this option from your command.",
		},
		excludeBlocks: {
			array: true,
			string: true,
			default: ["__TEMPLATE__"],
			describe:
				"A comma separated list of the folder names of blocks to exclude from compilation. Requires experimental blocks support.",
		},
	})
	.showHelpOnFail(false, "Specify --help for available options")
	.parse();
// eslint-disable-next-line @typescript-eslint/naming-convention -- Experimental option.
const { experimentalBlocksSupport, ...compilerOptions } = argv;
const compiler = webpack(await defaultConfig({ ...compilerOptions }));

if (argv.watch) {
	const watching = compiler.watch(
		{
			// Example
			aggregateTimeout: 300,
			poll: undefined,
		},
		(error, stats) => {
			if (error) {
				console.error(error.stack ?? error);
				process.exitCode = 1;
				watching.close((closeError) => {
					console.error(closeError);
				});
			} else if (stats) {
				const info = stats.toJson();
				if (stats.hasErrors()) {
					const errors = info.errors!;
					console.warn("The compiler produced the following errors: \n");
					for (const error of errors) {
						console.warn(error.message);
					}
				}
				if (stats.hasWarnings()) {
					const warnings = info.warnings!;
					console.warn("The compiler produced the following warnings: \n");
					for (const warning of warnings) {
						console.warn(warning.message);
					}
				}
			}
		},
	);
	process.on("SIGINT", function () {
		watching.close((closeError) => {
			console.error(closeError);
		});
	});
} else {
	compiler.run((error, stats) => {
		if (error) {
			console.error(error);
			process.exitCode = 1;
		} else if (stats) {
			const info = stats.toJson();
			if (stats.hasErrors()) {
				const errors = info.errors!;
				console.warn("The compiler produced the following errors: \n");
				for (const error of errors) {
					console.warn(error.message);
				}
				process.exitCode = 1;
			}
			if (stats.hasWarnings()) {
				const warnings = info.warnings!;
				console.warn("The compiler produced the following warnings: \n");
				for (const warning of warnings) {
					console.warn(warning.message);
				}
				if (!stats.hasErrors()) {
					process.exitCode = 2;
				}
			}
		}

		compiler.close((closeError) => {
			if (closeError) {
				process.exitCode = 1;
			}
		});
	});
}
