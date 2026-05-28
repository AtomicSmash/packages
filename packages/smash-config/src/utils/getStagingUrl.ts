import { SmashConfig } from "../";
import { getConfigs } from "../";

export default function getStagingUrl(config: SmashConfig): string {
	const [value] = getConfigs(config, ["staging.url"]);
	return value
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/$/, "");
}
