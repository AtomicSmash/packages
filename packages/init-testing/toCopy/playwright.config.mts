import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";
import { playwrightConfig } from "@atomicsmash/test-utils";
import { projects as authProjects } from "./tests/auth";%%EXAMPLE_TEST_IMPORT%%%%UNIVERSAL_TEST_IMPORT%%

const playwrightProjectsConfig = [
	...authProjects,%%EXAMPLE_TEST_PROJECTS%%%%UNIVERSAL_TEST_PROJECTS%%
] satisfies PlaywrightTestConfig["projects"];

export default defineConfig(playwrightConfig, {
	use: { baseURL: `%%BASE_URL%%` },
});
