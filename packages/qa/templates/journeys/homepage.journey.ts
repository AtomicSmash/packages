import { expect, journey, role, visit } from "@atomicsmash/qa";

export default journey({
	name: "Homepage loads",
	steps: [visit("/"), expect.visible(role("banner")), expect.noConsoleErrors()],
});
