import type { Diagnostics, FailureClass } from "../report.js";
import type { Step } from "../types.js";
import { isAssertion } from "./describe.js";

const SERVER_ERROR_PATTERNS = [
	/<b>(?:Fatal error|Parse error)<\/b>:/i,
	/\bFatal error:\s/i,
	/\bUncaught (?:Error|Exception|TypeError)\b/,
	/There has been a critical error on this website/i,
	/<b>(?:Warning|Notice|Deprecated)<\/b>:/i,
	/Error establishing a database connection/i,
];

/**
 * Find PHP and WordPress error output in page HTML.
 */
export function findServerErrorMarkers(html: string): string[] {
	return SERVER_ERROR_PATTERNS.flatMap((pattern) => {
		const match = pattern.exec(html);
		if (!match) {
			return [];
		}
		const start = match.index;
		return [
			html
				.slice(start, start + 200)
				.replace(/<[^>]+>/g, "")
				.replace(/\s+/g, " ")
				.trim(),
		];
	});
}

/**
 * Classify a failed step from its Playwright error message and the page evidence.
 */
export function classifyFailure(
	step: Step,
	message: string,
	diagnostics: Pick<Diagnostics, "documentStatus">,
): FailureClass {
	if (/is not set\. Add it|is not defined for this environment/.test(message)) {
		return "config";
	}
	if (diagnostics.documentStatus && diagnostics.documentStatus >= 400) {
		return "http-error";
	}
	if (/net::ERR_|NS_ERROR_|Navigation failed|page\.goto/i.test(message)) {
		return "navigation";
	}
	if (/strict mode violation/i.test(message)) {
		return "locator-ambiguous";
	}
	if (isAssertion(step)) {
		return "assertion-mismatch";
	}
	if (
		/waiting for (?:get|locator)|element\(s\) not found|to be visible/i.test(
			message,
		)
	) {
		return "locator-not-found";
	}
	if (/timeout/i.test(message)) {
		return "timeout";
	}
	return "unknown";
}

/**
 * List factual signals that the failure is a real site problem rather than test drift.
 */
export function findBugSignals(
	diagnostics: Diagnostics,
	failureClass: FailureClass,
): string[] {
	return [
		diagnostics.documentStatus && diagnostics.documentStatus >= 500
			? `Page returned HTTP ${diagnostics.documentStatus.toString()}`
			: undefined,
		diagnostics.documentStatus === 404 ? "Page returned HTTP 404" : undefined,
		...diagnostics.serverErrorMarkers.map(
			(marker) => `Server error output on page: ${marker}`,
		),
		diagnostics.consoleErrors.length
			? `${diagnostics.consoleErrors.length.toString()} console error(s)`
			: undefined,
		...diagnostics.failedRequests
			.filter((request) => request.status >= 500)
			.map(
				(request) =>
					`${request.method} ${request.url} returned HTTP ${request.status.toString()}`,
			),
		failureClass === "locator-not-found" && !diagnostics.candidates.length
			? "Target element not found and nothing similar is on the page"
			: undefined,
	].filter((signal) => signal !== undefined);
}
