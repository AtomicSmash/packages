import { defineConfig } from "vitest/config";
import {
	setup as cliSetup,
	teardown as cliTeardown,
} from "./packages/cli/src/test-setup";

export default defineConfig({
	test: {
		include: ["packages/*/src/**/*.test.{js,mjs,cjs,ts,jsx,tsx}"],
		watchExclude: ["**/node_modules/**", "**/dist/**"],
		globalSetup: ["./packages/cli/src/test-setup.ts"],
		teardownTimeout: 10000,
		reporters: [
			"default",
			{
				async onWatcherRerun() {
					// Delete test package and node_modules
					await cliTeardown();
					// re-create new test package based on new build
					await cliSetup();
				},
			},
		],
	},
});
