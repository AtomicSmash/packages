import { SmashConfig } from ".";
import { getConfig } from ".";

export function getStagingUrl(config: SmashConfig): string {
    const value = getConfig(config, "staging.url");
	return value.endsWith("/")
		? value.slice(0, -1)
		: value;
}