import type { Candidate } from "./runtime/candidates.js";
import type { Environment, LocatedStep } from "./types.js";

/** What kind of failure happened, as a starting point for deciding drift vs. bug. */
export type FailureClass =
	| "locator-not-found"
	| "locator-ambiguous"
	| "assertion-mismatch"
	| "navigation"
	| "http-error"
	| "config"
	| "timeout"
	| "unknown";

/** Evidence gathered from the page while a journey ran and at the moment it failed. */
export type Diagnostics = {
	url?: string;
	title?: string;
	documentStatus?: number;
	consoleErrors: string[];
	failedRequests: { url: string; status: number; method: string }[];
	serverErrorMarkers: string[];
	ariaSnapshot?: string;
	candidates: Candidate[];
};

/** Details of the step a journey failed on. */
export type StepFailure = {
	index: number;
	description: string;
	step: LocatedStep;
	isAssertion: boolean;
	failureClass: FailureClass;
	message: string;
	/** Factual signals that point towards a real bug rather than test drift. */
	bugSignals: string[];
	diagnostics: Diagnostics;
};

/** The result of one journey on one browser project. */
export type JourneyResult = {
	name: string;
	file: string;
	project: string;
	mutates: boolean;
	tags: string[];
	/** The WordPress role the journey ran as, if logged in. */
	as?: string;
	status: "passed" | "failed" | "skipped" | "timedOut" | "interrupted";
	durationMs: number;
	failure?: StepFailure;
	error?: string;
	screenshots: string[];
	trace?: string;
};

/** The machine-readable report written by `smash-qa run`, read by the self-healing skill. */
export type RunReport = {
	env: Environment;
	baseURL: string;
	startedAt: string;
	finishedAt: string;
	status: "passed" | "failed" | "timedout" | "interrupted";
	summary: { passed: number; failed: number; skipped: number };
	journeys: JourneyResult[];
};

/** Name of the test attachment that carries a {@link StepFailure} from the test to the reporter. */
export const FAILURE_ATTACHMENT = "smash-qa-failure";

/** Name of the test annotation that carries journey metadata to the reporter. */
export const JOURNEY_ANNOTATION = "smash-qa-journey";
