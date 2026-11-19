import type { RunContext } from "../types.js";

/** Environment variable the CLI uses to hand the run context to the Playwright process. */
export const RUN_CONTEXT_VARIABLE = "SMASH_QA_RUN";

/**
 * Read the run context the CLI passed to the Playwright process.
 */
export function readRunContext(): RunContext {
	const raw = process.env[RUN_CONTEXT_VARIABLE];
	if (!raw) {
		throw new Error(
			"No smash-qa run context found. Run journeys with `npx smash-qa run`, not `playwright test`.",
		);
	}
	return JSON.parse(raw) as RunContext;
}
