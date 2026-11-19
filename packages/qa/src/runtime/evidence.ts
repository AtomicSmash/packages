import type { Diagnostics, StepFailure } from "../report.js";
import type { LocatedStep } from "../types.js";
import type { Page } from "@playwright/test";
import { findCandidates, parseAriaSnapshot } from "./candidates.js";
import {
	classifyFailure,
	findBugSignals,
	findServerErrorMarkers,
} from "./classify.js";
import { describeStep, isAssertion } from "./describe.js";

const MAX_SNAPSHOT_LENGTH = 20_000;

/** Evidence collected continuously while a journey runs. */
export type PageEvidence = Pick<
	Diagnostics,
	"consoleErrors" | "failedRequests"
> & { documentStatus?: number };

/**
 * Listen to the page for console errors, failed requests and the main document's status.
 */
export function trackPage(page: Page): PageEvidence {
	const evidence: PageEvidence = { consoleErrors: [], failedRequests: [] };
	page.on("console", (message) => {
		if (message.type() === "error") {
			evidence.consoleErrors.push(message.text());
		}
	});
	page.on("pageerror", (error) => {
		evidence.consoleErrors.push(`Uncaught: ${error.message}`);
	});
	page.on("response", (response) => {
		const request = response.request();
		if (response.status() >= 400) {
			evidence.failedRequests.push({
				url: response.url(),
				status: response.status(),
				method: request.method(),
			});
		}
		if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
			evidence.documentStatus = response.status();
		}
	});
	return evidence;
}

/**
 * Strip terminal colour codes from Playwright error messages.
 */
const stripAnsi = (value: string) =>
	value.replace(new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g"), "");

/**
 * Snapshot the page at the moment a step failed and describe the failure for the reporter.
 */
export async function describeFailure(
	page: Page,
	step: LocatedStep,
	index: number,
	error: unknown,
	evidence: PageEvidence,
): Promise<StepFailure> {
	const message = stripAnsi(
		error instanceof Error ? error.message : String(error),
	);
	const [ariaSnapshot, html, title] = await Promise.all([
		page
			.locator("body")
			.ariaSnapshot({ timeout: 5_000 })
			.catch(() => undefined),
		page.content().catch(() => ""),
		page.title().catch(() => undefined),
	]);
	const failureClass = classifyFailure(step, message, evidence);
	const target = "target" in step ? step.target : undefined;
	const diagnostics: Diagnostics = {
		url: page.url(),
		title,
		documentStatus: evidence.documentStatus,
		consoleErrors: [...evidence.consoleErrors],
		failedRequests: [...evidence.failedRequests],
		serverErrorMarkers: findServerErrorMarkers(html),
		ariaSnapshot: ariaSnapshot?.slice(0, MAX_SNAPSHOT_LENGTH),
		candidates:
			target && ariaSnapshot
				? findCandidates(target, parseAriaSnapshot(ariaSnapshot))
				: [],
	};
	return {
		index,
		description: describeStep(step),
		step,
		isAssertion: isAssertion(step),
		failureClass,
		message,
		bugSignals: findBugSignals(diagnostics, failureClass),
		diagnostics,
	};
}
