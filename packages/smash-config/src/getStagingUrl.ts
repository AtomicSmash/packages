import { getConfig } from "./getConfigVar.js";
import { SmashConfig } from "./index.js";

export function getStagingUrl(config: SmashConfig): string {
	const value = getConfig(config, "staging.url");
	return value
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/$/, "");
}
