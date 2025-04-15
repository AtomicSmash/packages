import {
	doLighthouseTest,
	lighthouseTest,
} from "@atomicsmash/test-utils";
import { pagesToTest } from "../../playwright-utils.mjs";

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
