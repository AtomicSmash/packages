import type { ArgumentsCamelCase, Argv } from "yargs";
import { ENVIRONMENTS } from "../environment.js";
import { findJourneys, journeyFile } from "../project.js";

type ListArguments = { json: boolean };

export const command = "list";
export const describe =
	"List the journeys in qa/qa.config.ts with their environments and tags.";

/**
 * Define the list command's arguments.
 */
export function builder(yargs: Argv) {
	return yargs.option("json", {
		type: "boolean",
		default: false,
		describe: "Print the journeys as JSON",
	});
}

/**
 * Print every journey listed in qa/qa.config.ts.
 */
export async function handler(args: ArgumentsCamelCase<ListArguments>) {
	const journeys = (await findJourneys()).flatMap(({ file, journeys }) =>
		journeys.map((journey) => ({
			file: journeyFile(journey, file),
			name: journey.name,
			envs: journey.envs ?? ENVIRONMENTS,
			mutates: journey.mutates ?? false,
			tags: journey.tags ?? [],
			as: journey.as,
			steps: journey.steps.length,
		})),
	);
	if (args.json) {
		console.log(JSON.stringify(journeys, null, "\t"));
		return;
	}
	if (!journeys.length) {
		console.log("No journeys listed in qa/qa.config.ts.");
		return;
	}
	journeys.forEach(({ file, name, envs, mutates, tags, as, steps }) => {
		const details = [
			file,
			`${steps.toString()} steps`,
			envs.join(", "),
			as && `as ${as}`,
			mutates && "changes data",
			tags.join(", "),
		].filter(Boolean);
		console.log(`${name}\n  ${details.join(" · ")}`);
	});
}
