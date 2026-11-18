import type { Diagnostics } from "../report";
import { describe, expect, test } from "vitest";
import {
	classifyFailure,
	findBugSignals,
	findServerErrorMarkers,
} from "../runtime/classify";

const click = {
	action: "click",
	target: { by: "role", role: "button", name: "Buy" },
} as const;

describe("classifyFailure()", () => {
	test.each([
		[
			click,
			"locator.click: Timeout 30000ms exceeded.\nwaiting for getByRole('button', { name: 'Buy' })",
			{},
			"locator-not-found",
		],
		[
			click,
			"strict mode violation: getByRole('button') resolved to 2 elements",
			{},
			"locator-ambiguous",
		],
		[
			{ action: "expectText", text: "Thanks" },
			"expect(locator).toBeVisible() failed",
			{},
			"assertion-mismatch",
		],
		[
			{ action: "visit", path: "/" },
			"page.goto: net::ERR_CONNECTION_REFUSED",
			{},
			"navigation",
		],
		[
			{ action: "visit", path: "/" },
			"Navigation returned HTTP 500",
			{ documentStatus: 500 },
			"http-error",
		],
		[
			{ action: "visit", path: { env: "X" } },
			'Environment variable "X" is not set. Add it to the project\'s .env file.',
			{},
			"config",
		],
	] as const)("%#: %s", (step, message, diagnostics, expected) => {
		expect(classifyFailure(step, message, diagnostics)).toBe(expected);
	});
});

test("findServerErrorMarkers()", () => {
	expect(
		findServerErrorMarkers(
			"<p><b>Fatal error</b>: Uncaught Error: Call to undefined function foo() in /var/www/theme/functions.php:12</p>",
		)[0],
	).toContain("Fatal error: Uncaught Error: Call to undefined function foo()");
	expect(findServerErrorMarkers("<p>All good</p>")).toEqual([]);
});

test("findBugSignals()", () => {
	const diagnostics: Diagnostics = {
		documentStatus: 500,
		consoleErrors: ["TypeError: x is undefined"],
		failedRequests: [
			{
				url: "https://site.test/?wc-ajax=checkout",
				status: 502,
				method: "POST",
			},
		],
		serverErrorMarkers: [],
		candidates: [],
	};
	expect(findBugSignals(diagnostics, "locator-not-found")).toEqual([
		"Page returned HTTP 500",
		"1 console error(s)",
		"POST https://site.test/?wc-ajax=checkout returned HTTP 502",
		"Target element not found and nothing similar is on the page",
	]);
});
