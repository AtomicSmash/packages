import {
	doLighthouseTest,
	lighthouseTest,
	checkPrivilegedPages,
	checkForLoremIpsum,
	doesRoleHaveHighEnoughPermissions,
} from "@atomicsmash/test-utils";
import { test, pagesToTest } from "../../playwright-utils.mjs";

const pagesRequiringAuthentication = pagesToTest.filter(
	(page) =>
		// If a page requires any kind of login
		!doesRoleHaveHighEnoughPermissions(
			"unauthenticated",
			page.minimumUserPrivilege ?? "unauthenticated",
		),
);

if (pagesRequiringAuthentication.length) {
	test(
		"privileged pages of the site to ensure non-logged in users can't access them",
		checkPrivilegedPages(pagesRequiringAuthentication),
	);
}
test("No lingering lorem ipsum on the site", checkForLoremIpsum(pagesToTest));

lighthouseTest.describe.configure({ mode: "parallel", retries: 3 });
for (const pageToTest of pagesToTest) {
	if (
		// If a page requires any kind of login
		!doesRoleHaveHighEnoughPermissions(
			"unauthenticated",
			pageToTest.minimumUserPrivilege ?? "unauthenticated",
		)
	) {
		continue;
	}
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
