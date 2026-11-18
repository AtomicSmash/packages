import { existsSync } from "node:fs";
import { appendFile, copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getProjectPaths } from "../project.js";

const TEMPLATES_DIR = new URL("../../templates/", import.meta.url);

const FILES = [
	["qa.config.ts", "qa/qa.config.ts"],
	["memory.md", "qa/memory.md"],
	["journeys/homepage.journey.ts", "qa/journeys/homepage.journey.ts"],
] as const;

/**
 * Add `.qa/` to the project's .gitignore unless it is already there.
 */
async function ignoreRunDirectory() {
	const existing = existsSync(".gitignore")
		? await readFile(".gitignore", "utf8")
		: "";
	if (existing.split("\n").some((line) => line.trim() === ".qa/")) {
		return false;
	}
	const separator = existing && !existing.endsWith("\n") ? "\n" : "";
	await appendFile(".gitignore", `${separator}.qa/\n`);
	return true;
}

export const command = "init";
export const describe =
	"Set up the qa/ folder with an example journey, test data config and memory file.";

/**
 * Scaffold the QA files without overwriting anything that already exists.
 */
export async function handler() {
	await mkdir(getProjectPaths().journeysDir, { recursive: true });
	for (const [template, destination] of FILES) {
		if (existsSync(destination)) {
			console.log(`Skipped ${destination} (already exists)`);
			continue;
		}
		await mkdir(dirname(destination), { recursive: true });
		await copyFile(new URL(template, TEMPLATES_DIR), join(destination));
		console.log(`Created ${destination}`);
	}
	if (await ignoreRunDirectory()) {
		console.log("Added .qa/ to .gitignore");
	}
	console.log(`
Next steps:
  1. npm install --save-dev @atomicsmash/qa @playwright/test
  2. npx playwright install chromium
  3. If the local site isn't https://<projectName>.test, add local: { url } to smash.config.ts
  4. npx smash-qa run --env local`);
}
