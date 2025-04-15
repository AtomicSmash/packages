import {
	checkPrivilegedPages,
	checkForLoremIpsum,
} from "@atomicsmash/test-utils";
import { test, pagesToTest } from "../../playwright-utils.mjs";

test(
	"privileged pages of the site to ensure non-logged in users can't access them",
	checkPrivilegedPages(pagesToTest),
);
test("No lingering lorem ipsum on the site", checkForLoremIpsum(pagesToTest));
