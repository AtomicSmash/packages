#!/usr/bin/env node
import { existsSync } from "node:fs";
import {
	readFile,
	writeFile,
	readdir,
	appendFile,
	mkdir,
} from "node:fs/promises";
import { resolve as pathResolve, relative as pathRelative } from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { PackageManager } from "./utils.js";

type JSONValue =
	| string
	| number
	| boolean
	| { [x: string]: JSONValue }
	| JSONValue[];

const packageManager = new PackageManager(
	await import(`${process.cwd()}/package.json`, { with: { type: "json" } })
		.then((module: { default: JSONValue }) => module.default)
		.catch((error: unknown) => {
			console.log({ error });
			throw new Error(
				"Unable to find package.json in your cwd. Make sure you're running this command in the right folder.",
			);
		}),
	await import(`${process.cwd()}/package-lock.json`, { with: { type: "json" } })
		.then((module: { default: JSONValue }) => module.default)
		.catch((error: unknown) => {
			console.log({ error });
			throw new Error(
				"Unable to find package-lock.json in your cwd. Make sure you're running this command in the right folder.",
			);
		}),
);

const hasRootTSConfig = existsSync(`${process.cwd()}/tsconfig.json`);

const argv = await yargs(hideBin(process.argv))
	.options({
		"base-url": {
			demandOption: true,
			describe: "Base URL to use in actions like `await page.goto('/')`",
			type: "string",
		},
		"overwrite-files": {
			boolean: true,
			default: false,
			describe: "If present, will overwrite existing files when copying.",
		},
		"no-example": {
			boolean: true,
			default: false,
			describe: "If present, don't copy over the playwright example tests.",
		},
		"no-universal": {
			boolean: true,
			default: false,
			describe:
				"If present, don't copy over the Atomic Smash universal tests (NOT RECOMMENDED).",
		},
	})
	.showHelpOnFail(false, "Specify --help for available options")
	.parse();

const fileCopies: Promise<string>[] = [];
const copyFolder = pathResolve(import.meta.dirname, "../toCopy");
const copyFiles = await readdir(copyFolder, {
	withFileTypes: true,
	recursive: true,
});
for (const dirent of copyFiles) {
	let relativePath = pathRelative(copyFolder, `${dirent.path}`);
	if (relativePath !== "" && !relativePath.endsWith("/")) {
		relativePath = `${relativePath}/`;
	}
	if (!dirent.isFile()) {
		continue;
	}
	if (argv.noExample && dirent.name.includes("example")) {
		continue;
	}
	if (argv.noUniversal && dirent.name.includes("universal")) {
		continue;
	}
	fileCopies.push(
		readFile(`${dirent.parentPath}/${dirent.name}`, "utf8")
			.then(async (data) => {
				for (const [search, replace] of [
					["%%BASE_URL%%", argv.baseUrl],
					[
						"%%TS_CONFIG_LOCATION%%",
						hasRootTSConfig
							? "../tsconfig.json"
							: "@atomicsmash/coding-standards/typescript/base",
					],
					[
						"%%EXAMPLE_TEST_IMPORT%%",
						argv.noExample
							? ""
							: '\nimport { projects as exampleProjects } from "./tests/e2e/example/index.mjs";',
					],
					[
						"%%EXAMPLE_TEST_PROJECTS%%",
						argv.noExample ? "" : "\n	...exampleProjects,",
					],
					[
						"%%UNIVERSAL_TEST_IMPORT%%",
						argv.noUniversal
							? ""
							: '\nimport { projects as universalProjects } from "./tests/e2e/universal/index.mjs";',
					],
					[
						"%%UNIVERSAL_TEST_PROJECTS%%",
						argv.noUniversal ? "" : "\n	...universalProjects,",
					],
				] as const) {
					data = data.replace(search, replace);
				}
				await mkdir(`${process.cwd()}/${relativePath}`.slice(0, -1), {
					recursive: true,
				});
				await writeFile(
					`${process.cwd()}/${relativePath}${dirent.name}`,
					data,
					{ encoding: "utf8", flag: argv.overwriteFiles ? "w" : "wx" },
				);
				return `${relativePath}${dirent.name} copied successfully.`;
			})
			.catch(
				(error) =>
					`${relativePath}${dirent.name} failed to copy. Error: ${error}`,
			),
	);
}

await Promise.all([
	Promise.allSettled([
		packageManager.ensurePackageIsInstalled("@atomicsmash/test-utils", {
			packageConstraint: "^4.0.0",
			type: "dev",
		}),
		packageManager.ensurePackageIsInstalled(
			"@atomicsmash/wordpress-tests-helper",
			{ packageConstraint: "^1.0.0", type: "dev" },
		),
		packageManager.ensurePackageIsInstalled("@playwright/test", {
			packageConstraint: "^1.0.0",
			type: "dev",
		}),
		packageManager.ensurePackageIsInstalled("close-with-grace", {
			packageConstraint: "^1.0.0",
			type: "dev",
		}),
		packageManager.ensurePackageIsInstalled("msw", {
			packageConstraint: "^2.0.0",
			type: "dev",
		}),
		packageManager.ensurePackageIsInstalled("cross-env", {
			packageConstraint: "^7.0.0",
			type: "dev",
		}),
		async () => {
			const [major, minor] = process.versions.node.split(".");
			return packageManager.ensurePackageIsInstalled("@types/node", {
				packageConstraint: `${major}.${minor}.x`,
				type: "dev",
			});
		},
		!hasRootTSConfig
			? packageManager.ensurePackageIsInstalled("typescript", {
					packageConstraint: "~5.8.0",
					type: "dev",
				})
			: false,
	])
		.then((results) => {
			if (
				results.some((result) => {
					return result.status === "fulfilled" && result.value === true;
				})
			) {
				const installedPackages = [
					...packageManager.commands.install,
					...packageManager.commands.devInstall,
				];
				packageManager.runCommands();
				console.log(`Packages installed: ${installedPackages.join(",")}.`);
			}
			return results[1].status === "fulfilled" && results[1].value === true;
		})
		.then((shouldInstallPlaywright) => {
			if (shouldInstallPlaywright) {
				console.log("Running playwright installer...");
				// Run Playwright installer after package install
				packageManager.commands.basic.push("npx playwright install");
				packageManager.runCommands();
				console.log("Playwright installer finished.");
			}
		}),
	Promise.allSettled(fileCopies).then((results) => {
		results.forEach((result) => {
			console.log(result.status === "fulfilled" ? result.value : result.reason);
		});
	}),
	readFile(`${process.cwd()}/.gitignore`)
		.then((data) => {
			return data.toString().split("\n");
		})
		.then((fileLines) => {
			const linesToCheck = [
				"/test-results/",
				"/playwright-report/",
				"/blob-report/",
				"/playwright/.cache/",
				"/lighthouse/",
			];
			const linesToAddToGitignore: string[] = [];
			for (const line of linesToCheck) {
				if (!fileLines.includes(line)) {
					linesToAddToGitignore.push(line);
				}
			}
			return {
				linesToAddToGitignore,
				fileEndsWithEmptyLine: fileLines.at(-1) === "",
			};
		})
		.then(async ({ linesToAddToGitignore, fileEndsWithEmptyLine }) => {
			if (linesToAddToGitignore.length === 0) {
				return false;
			}
			await appendFile(
				`${process.cwd()}/.gitignore`,
				`${fileEndsWithEmptyLine ? "\n" : "\n\n"}# Testing tools\n${linesToAddToGitignore.join(`\n`)}\n`,
			);
			return true;
		})
		.then((wasFileUpdated) => {
			if (wasFileUpdated) {
				console.log(".gitignore updated");
			} else {
				console.log(
					".gitignore not updated as all values are already in the file.",
				);
			}
		}),
]);
