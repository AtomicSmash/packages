import type { Environment, RunContext } from "./types.js";
import type { SmashConfigV2Resolved } from "@atomicsmash/smash-config";

/** The environments smash-qa can target. */
export const ENVIRONMENTS = [
	"local",
	"staging",
] as const satisfies Environment[];

/**
 * Work out the base URL and HTTP auth for an environment from the resolved smash config.
 */
export function resolveEnvironment(
	env: Environment,
	config: Pick<SmashConfigV2Resolved, "local" | "staging">,
): Pick<RunContext, "baseURL" | "httpCredentials"> {
	return env === "local"
		? { baseURL: config.local.url }
		: {
				baseURL: `https://${config.staging.url}`,
				httpCredentials: config.staging.httpAuth,
			};
}
