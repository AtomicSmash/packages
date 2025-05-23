import {
	doLighthouseTest,
	lighthouseTest,
	doesRoleHaveHighEnoughPermissions,
} from "@atomicsmash/test-utils";
import { pagesToTest } from "../../playwright-utils.mjs";

lighthouseTest.describe.configure({ mode: "parallel", retries: 3 });
for (const pageToTest of pagesToTest) {
	if (
		// If a page requires any kind of login
		!doesRoleHaveHighEnoughPermissions(
			"unauthenticated",
			pageToTest.minimumUserPrivilege ?? "unauthenticated",
		)
	) {
		lighthouseTest.describe(`${pageToTest.name} Lighthouse tests`, () => {
			lighthouseTest(
				`${pageToTest.name} @desktop @lighthouse`,
				doLighthouseTest(pageToTest, "desktop", true),
			);
			lighthouseTest(
				`${pageToTest.name} @mobile @lighthouse`,
				doLighthouseTest(pageToTest, "mobile", true),
			);
		});
	}
}
