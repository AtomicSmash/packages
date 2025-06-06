import { devices, PlaywrightTestConfig } from "@playwright/test";

export const setupName = "Admin login";
export const tearDownName = "Admin teardown";
export const storageState = "tests/.tmp/admin.auth.json";
export const projects = [
	{
		name: setupName,
		use: { ...devices["Desktop Chrome"] },
		testDir: "./tests/auth",
		testMatch: /admin\.setup\.mts/,
		teardown: "Admin teardown",
	},
	{
		name: tearDownName,
		use: { ...devices["Desktop Chrome"] },
		testDir: "./tests/auth",
		testMatch: /admin\.teardown\.mts/,
	},
] satisfies PlaywrightTestConfig["projects"];
