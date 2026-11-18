import type { Journey, JourneyExport, QaConfig } from "./types.js";
import { existsSync } from "node:fs";
import { relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Where a project's committed QA files and generated run files live. */
export const getProjectPaths = (cwd = process.cwd()) => ({
	qaDir: resolve(cwd, "qa"),
	journeysDir: resolve(cwd, "qa/journeys"),
	qaConfigFile: resolve(cwd, "qa/qa.config.ts"),
	runDir: resolve(cwd, ".qa"),
});

/** A module journeys are loaded from, and the journeys selected from it. */
export type JourneySource = {
	/** Path relative to the project root: qa/qa.config.ts, or a journey file run directly. */
	file: string;
	journeys: Journey[];
};

/**
 * Import a TypeScript module's default export using Node's built-in type stripping.
 */
async function importDefault<T>(file: string): Promise<T> {
	const module = (await import(pathToFileURL(resolve(file)).href)) as {
		default: T;
	};
	return module.default;
}

/**
 * Flatten what journey files export into a single list.
 */
export const flattenJourneys = (journeys: JourneyExport[] = []): Journey[] =>
	journeys.flat();

/**
 * The project-relative file a journey was defined in, falling back to the module it came from.
 */
export const journeyFile = (
	journey: Journey,
	fallback: string,
	cwd = process.cwd(),
) => (journey.location ? relative(cwd, journey.location.file) : fallback);

/**
 * Load qa/qa.config.ts, or an empty config when the project has none.
 */
export async function loadQaConfig(cwd = process.cwd()): Promise<QaConfig> {
	const { qaConfigFile } = getProjectPaths(cwd);
	return existsSync(qaConfigFile) ? importDefault<QaConfig>(qaConfigFile) : {};
}

/**
 * Load the journeys listed in qa/qa.config.ts, or those exported by journey files given directly.
 * A direct file is how the healing skill trials a fix from `.qa/heal/` without touching the config.
 */
async function loadSources(files: string[], cwd: string) {
	if (!files.length) {
		const { journeys } = await loadQaConfig(cwd);
		return [
			{
				file: relative(cwd, getProjectPaths(cwd).qaConfigFile),
				journeys: flattenJourneys(journeys),
			},
		];
	}
	return Promise.all(
		files.map(async (file) => ({
			file: relative(cwd, resolve(cwd, file)),
			journeys: flattenJourneys([
				await importDefault<JourneyExport>(resolve(cwd, file)),
			]),
		})),
	);
}

/**
 * Throw when two journeys share a name, since names identify journeys in filters and reports.
 */
function assertUniqueNames(sources: JourneySource[]) {
	const names = sources.flatMap(({ journeys }) =>
		journeys.map(({ name }) => name),
	);
	const duplicate = names.find((name, index) => names.indexOf(name) !== index);
	if (duplicate) {
		throw new Error(
			`Two journeys are named "${duplicate}". Names must be unique.`,
		);
	}
}

/**
 * Find the journeys to run. Filters that are `.journey.ts` files are loaded directly instead of
 * qa/qa.config.ts; every other filter keeps journeys whose name or file contains it.
 */
export async function findJourneys(
	filters: string[] = [],
	cwd = process.cwd(),
): Promise<JourneySource[]> {
	const isJourneyFile = (filter: string) =>
		filter.endsWith(".journey.ts") && existsSync(resolve(cwd, filter));
	const patterns = filters
		.filter((filter) => !isJourneyFile(filter))
		.map((pattern) => pattern.toLowerCase());
	const sources = await loadSources(filters.filter(isJourneyFile), cwd);
	assertUniqueNames(sources);
	const matches = (journey: Journey, source: string) =>
		!patterns.length ||
		patterns.some((pattern) =>
			[journey.name, journeyFile(journey, source, cwd)].some((value) =>
				value.toLowerCase().includes(pattern),
			),
		);
	return sources
		.map(({ file, journeys }) => ({
			file,
			journeys: journeys.filter((journey) => matches(journey, file)),
		}))
		.filter(({ journeys }) => journeys.length);
}
