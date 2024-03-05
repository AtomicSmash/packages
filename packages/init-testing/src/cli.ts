#!/usr/bin/env node
import { readFile, writeFile, readdir, appendFile } from "node:fs/promises";
import { dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { PackageManager } from "./utils.js";

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = pathDirname(__filename);

const packageManager = new PackageManager(
	await import(`${process.cwd()}/package.json`).catch(() => {
		throw new Error(
			"Unable to find package.json in your cwd. Make sure you're running this command in the right folder.",
		);
	}),
	await import(`${process.cwd()}/package-lock.json`).catch(() => {
		throw new Error(
			"Unable to find package-lock.json in your cwd. Make sure you're running this command in the right folder.",
		);
	}),
);

const argv = await yargs(hideBin(process.argv))
	.options({
		"base-url": {
			demandOption: true,
			describe: "Base URL to use in actions like `await page.goto('/')`",
			type: "string",
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
const copyFiles = await readdir(`${__dirname}/../toCopy`, {
	withFileTypes: true,
	recursive: true,
});
for (const dirent of copyFiles) {
	console.log({ name: dirent.name, path: dirent.path });
	if (!dirent.isFile()) {
		continue;
	}
	if (argv.noExample && dirent.name === "example.spec.ts") {
		continue;
	}
	if (argv.noUniversal && dirent.name === "universal.spec.ts") {
		continue;
	}
	fileCopies.push(
		readFile(dirent.path, "utf8")
			.then(async (data) => {
				for (const [search, replace] of [
					["%%BASE_URL%%", argv.baseUrl],
				] as const) {
					data = data.replace(search, replace);
				}
				await writeFile(dirent.path, data, "utf8");
				return `${dirent.name} copied successfully.`;
			})
			.catch((error) => `${dirent.name} failed to copy. Error: ${error}`),
	);
}

await Promise.all([
	Promise.allSettled([
		packageManager.ensurePackageIsInstalled("@atomicsmash/test-utils", {
			packageConstraint: "^1.0.0",
			type: "dev",
		}),
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
	]).then((results) => {
		if (
			results.some((result) => {
				return result.status === "fulfilled" && result.value === true;
			})
		) {
			packageManager.runCommands();
		}
	}),
	Promise.allSettled(fileCopies).then((results) => {
		results.forEach((result) => {
			console.log(result.status === "fulfilled" ? result.value : result.reason);
		});
	}),
	appendFile(
		`${process.cwd()}/.gitignore`,
		`

# Testing tools
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
`,
	),
]);
