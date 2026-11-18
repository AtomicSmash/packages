import type { JourneyResult, RunReport, StepFailure } from "../report.js";
import type {
	FullResult,
	Reporter,
	TestCase,
	TestResult,
} from "@playwright/test/reporter";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { FAILURE_ATTACHMENT, JOURNEY_ANNOTATION } from "../report.js";
import { readRunContext } from "./context.js";

/**
 * Playwright reporter that writes the machine-readable report the self-healing skill reads.
 */
export default class SmashQaReporter implements Reporter {
	private readonly startedAt = new Date().toISOString();
	private readonly journeys: JourneyResult[] = [];

	/**
	 * Record the outcome of a journey, including the failure evidence attached by the runtime.
	 */
	onTestEnd(test: TestCase, result: TestResult): void {
		const meta = JSON.parse(
			test.annotations.find(({ type }) => type === JOURNEY_ANNOTATION)
				?.description ?? "{}",
		) as Partial<Pick<JourneyResult, "file" | "mutates" | "tags" | "as">>;
		const failureBody = result.attachments.find(
			({ name }) => name === FAILURE_ATTACHMENT,
		)?.body;
		const toRelative = (path: string) => relative(process.cwd(), path);

		this.journeys.push({
			name: test.title,
			file: meta.file ?? toRelative(test.location.file),
			project: test.parent.project()?.name ?? "unknown",
			mutates: meta.mutates ?? false,
			tags: meta.tags ?? [],
			...(meta.as ? { as: meta.as } : {}),
			status: result.status,
			durationMs: result.duration,
			...(failureBody
				? { failure: JSON.parse(failureBody.toString()) as StepFailure }
				: {}),
			...(result.error?.message && !failureBody
				? { error: result.error.message }
				: {}),
			screenshots: result.attachments
				.filter(({ contentType, path }) => contentType === "image/png" && path)
				.map(({ path }) => toRelative(path ?? "")),
			...(() => {
				const trace = result.attachments.find(({ name }) => name === "trace");
				return trace?.path ? { trace: toRelative(trace.path) } : {};
			})(),
		});
	}

	/**
	 * Write the run report once every journey has finished.
	 */
	onEnd(result: FullResult): void {
		const context = readRunContext();
		const count = (status: JourneyResult["status"][]) =>
			this.journeys.filter((journey) => status.includes(journey.status)).length;
		const report: RunReport = {
			env: context.env,
			baseURL: context.baseURL,
			startedAt: this.startedAt,
			finishedAt: new Date().toISOString(),
			status: result.status,
			summary: {
				passed: count(["passed"]),
				failed: count(["failed", "timedOut", "interrupted"]),
				skipped: count(["skipped"]),
			},
			journeys: this.journeys,
		};
		mkdirSync(dirname(context.reportFile), { recursive: true });
		writeFileSync(
			context.reportFile,
			`${JSON.stringify(report, null, "\t")}\n`,
		);
	}

	/**
	 * Keep Playwright's own console output; this reporter only writes a file.
	 */
	printsToStdio(): boolean {
		return false;
	}
}
