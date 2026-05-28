import type { SmashConfig } from "../index.js";
import { getConfigs } from "../index.js";

export default function getStagingUrl(config: SmashConfig): string {
	const [value] = getConfigs(config, ["staging.url"]);
	return value
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/$/, "");
}
