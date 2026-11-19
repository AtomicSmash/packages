import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, expect, test } from "vitest";
import { findJourneys } from "../project";

let cwd: string;

/**
 * A journey file exporting plain journey objects, located in the file itself.
 */
const journeyModule = (file: string, names: string[]) =>
	`export default ${JSON.stringify(
		names.map((name) => ({
			name,
			steps: [],
			location: { file: join(cwd, file), line: 1, column: 1 },
		})),
	)};`;

/**
 * Names of the journeys found per source file.
 */
const namesBySource = async (filters: string[] = []) =>
	(await findJourneys(filters, cwd)).map(({ file, journeys }) => ({
		file,
		names: journeys.map(({ name }) => name),
	}));

beforeAll(() => {
	cwd = mkdtempSync(join(tmpdir(), "smash-qa-"));
	mkdirSync(join(cwd, "qa/journeys"), { recursive: true });
	mkdirSync(join(cwd, ".qa/heal"), { recursive: true });
	const files = {
		"qa/journeys/blog.journey.ts": ["Blog archive"],
		"qa/journeys/checkout.journey.ts": ["Guest checkout", "Account checkout"],
		"qa/journeys/spa.journey.ts": ["SPA navigation"],
		".qa/heal/checkout.journey.ts": ["Guest checkout", "Account checkout"],
	};
	Object.entries(files).forEach(([file, names]) => {
		writeFileSync(join(cwd, file), journeyModule(file, names));
	});
	writeFileSync(
		join(cwd, "qa/qa.config.ts"),
		`import blog from "./journeys/blog.journey.ts";
import checkout from "./journeys/checkout.journey.ts";
// import spa from "./journeys/spa.journey.ts";
export default { journeys: [checkout, blog] };`,
	);
});

test("runs the journeys listed in qa.config.ts, skipping commented-out files", async () => {
	await expect(namesBySource()).resolves.toEqual([
		{
			file: "qa/qa.config.ts",
			names: ["Guest checkout", "Account checkout", "Blog archive"],
		},
	]);
});

test("filters by journey name, case-insensitively", async () => {
	await expect(namesBySource(["guest"])).resolves.toEqual([
		{ file: "qa/qa.config.ts", names: ["Guest checkout"] },
	]);
});

test("filters by journey file", async () => {
	await expect(namesBySource(["blog.journey"])).resolves.toEqual([
		{ file: "qa/qa.config.ts", names: ["Blog archive"] },
	]);
});

test("runs a journey file directly, such as a trial heal, narrowed by name", async () => {
	await expect(
		namesBySource([".qa/heal/checkout.journey.ts", "Account"]),
	).resolves.toEqual([
		{ file: ".qa/heal/checkout.journey.ts", names: ["Account checkout"] },
	]);
});

test("rejects journeys that share a name", async () => {
	await expect(
		findJourneys(
			[".qa/heal/checkout.journey.ts", "qa/journeys/checkout.journey.ts"],
			cwd,
		),
	).rejects.toThrow('Two journeys are named "Guest checkout"');
});
