import { defineConfig } from "vitest/config";
import {
	setup as cliSetup,
	teardown as cliTeardown,
} from "./packages/cli/test-setup";

export default defineConfig({
	test: {
		watchExclude: ["**/node_modules/**", "**/dist/**"],
		globalSetup: ["./packages/cli/test-setup.ts"],
		reporters: [
			"default",
			{
				async onWatcherRerun(files) {
					// Doesn't work yet
					// let changedPackages: string[] = [];
					// for (const file of files) {
					// 	let relativePath = pathRelative(__dirname, file);
					// 	if (relativePath.startsWith("packages")) {
					// 		const [, packageName] = relativePath.split("/");
					// 		changedPackages.push(packageName);
					// 	}
					// }
					// changedPackages = [...new Set(changedPackages)]; // Remove duplicates

					// for (const changedPackage of changedPackages) {
					// 	const module = (await import(
					// 		`./packages/${changedPackage}/test-setup.mjs`
					// 	).catch(() => null)) as {
					// 		setup?: () => Promise<void>;
					// 		teardown?: () => Promise<void>;
					// 	} | null;
					// 	if (module) {
					// 		if (module.teardown) {
					// 			await module.teardown();
					// 		}
					// 		if (module.setup) {
					// 			await module.setup();
					// 		}
					// 	}
					// }
					// Delete test package and node_modules
					await cliTeardown();
					// re-create new test package based on new build
					await cliSetup();
				},
			},
		],
	},
});
