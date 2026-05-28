import { getConfig } from "./getConfigVar.js";
import { SmashConfig } from "./index.js";

export function getStagingUrl(config: SmashConfig): string {
	const value = getConfig(config, "staging.url");
	return value.endsWith("/") ? value.slice(0, -1) : value;
}
