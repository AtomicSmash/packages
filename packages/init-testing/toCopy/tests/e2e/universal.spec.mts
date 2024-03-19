import {
	doLighthouseTest,
	checkPrivilegedPages,
	checkForLoremIpsum,
} from "@atomicsmash/test-utils";
import { test, lighthouseTest, pagesToTest } from "../playwright-utils.mjs";

test(
	"privileged pages of the site to ensure non-logged in users can't access them",
	checkPrivilegedPages(pagesToTest),
);
test("No lingering lorem ipsum on the site", checkForLoremIpsum(pagesToTest));

for (const pageToTest of pagesToTest) {
	lighthouseTest(
		`${pageToTest.name} @desktop @lighthouse`,
		doLighthouseTest(pageToTest, "desktop", true),
	);
	lighthouseTest(
		`${pageToTest.name} @mobile @lighthouse`,
		doLighthouseTest(pageToTest, "mobile", true),
	);
}
