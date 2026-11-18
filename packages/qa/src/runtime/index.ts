import type { Journey, JourneyExport } from "../types.js";
import { flattenJourneys, journeyFile } from "../project.js";
import { FAILURE_ATTACHMENT, JOURNEY_ANNOTATION } from "../report.js";
import { readRunContext } from "./context.js";
import { describeStep } from "./describe.js";
import { describeFailure, trackPage } from "./evidence.js";
import { executeStep } from "./execute.js";
import { test } from "@playwright/test";

/**
 * Register a journey as a Playwright test, running each step as a reported test step.
 */
function registerJourney(journey: Journey, file: string): void {
	const context = readRunContext();
	test(
		journey.name,
		{
			tag: journey.tags?.map((tag) => (tag.startsWith("@") ? tag : `@${tag}`)),
			annotation: {
				type: JOURNEY_ANNOTATION,
				description: JSON.stringify({
					file,
					mutates: journey.mutates ?? false,
					tags: journey.tags ?? [],
					as: journey.as,
				}),
			},
		},
		async ({ page }, testInfo) => {
			test.skip(
				journey.envs !== undefined && !journey.envs.includes(context.env),
				`Journey is not enabled for ${context.env}`,
			);
			if (journey.as) {
				await page.context().addCookies(context.sessions[journey.as] ?? []);
			}
			const evidence = trackPage(page);
			for (const [index, step] of journey.steps.entries()) {
				await test.step(
					describeStep(step),
					async () => {
						try {
							await executeStep(page, step, {
								data: context.data,
								consoleErrors: evidence.consoleErrors,
							});
						} catch (error) {
							const failure = await describeFailure(
								page,
								step,
								index,
								error,
								evidence,
							);
							await testInfo.attach(FAILURE_ATTACHMENT, {
								body: JSON.stringify(failure),
								contentType: "application/json",
							});
							throw error;
						}
					},
					{ location: step.location },
				);
			}
		},
	);
}

/**
 * Register the named journeys from a source module as Playwright tests.
 * Called from the specs that `smash-qa run` generates; not intended for use in journey files.
 */
export function registerJourneys(
	journeys: JourneyExport[],
	sourceFile: string,
	names: string[],
): void {
	flattenJourneys(journeys)
		.filter(({ name }) => names.includes(name))
		.forEach((journey) => {
			registerJourney(journey, journeyFile(journey, sourceFile));
		});
}
