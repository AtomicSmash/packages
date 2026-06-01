import type { SmashConfig } from "../index.js";

export default function getStagingUrl(config: SmashConfig): string {
	const {
		staging: { url },
	} = config;
	return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
