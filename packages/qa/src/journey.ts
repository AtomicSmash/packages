import type {
	AriaRole,
	DataValue,
	EnvValue,
	Journey,
	LocatedStep,
	QaConfig,
	SourceLocation,
	Step,
	Target,
	Value,
} from "./types.js";
import { fileURLToPath } from "node:url";

/**
 * Find where the step builder was called from, so failures can point at the exact journey line.
 */
function captureLocation(): SourceLocation | undefined {
	const thisFile = fileURLToPath(import.meta.url);
	const caller = (new Error().stack?.split("\n").slice(1) ?? [])
		.map((frame) => /\(?((?:file:\/\/)?[^\s()]+):(\d+):(\d+)\)?$/.exec(frame))
		.map((match) =>
			match?.[1] && match[2] && match[3]
				? {
						file: match[1].startsWith("file://")
							? fileURLToPath(match[1])
							: match[1],
						line: Number(match[2]),
						column: Number(match[3]),
					}
				: undefined,
		)
		.find((frame) => frame && frame.file !== thisFile);
	return caller;
}

/**
 * Attach the caller's source location to a step.
 */
function located(step: Step): LocatedStep {
	const location = captureLocation();
	return location ? { ...step, location } : step;
}

/**
 * Define a user journey. Default-export one, or an array of related ones, from a `*.journey.ts`
 * file and list that file in qa/qa.config.ts `journeys`.
 */
export const journey = (definition: Omit<Journey, "location">): Journey => {
	const location = captureLocation();
	return location ? { ...definition, location } : definition;
};

/** Define per-project QA settings. Export it as the default export of qa/qa.config.ts. */
export const defineQaConfig = (config: QaConfig): QaConfig => config;

/** Read a value from the environment (or `.env`) at run time, e.g. credentials. */
export const env = (name: string): EnvValue => ({ env: name });

/** Read a value from the current environment's `data` in qa/qa.config.ts. */
export const data = (key: string): DataValue => ({ data: key });

/** Target an element by ARIA role and accessible name. */
export const role = (
	ariaRole: AriaRole,
	name?: string,
	options: { exact?: boolean } = {},
): Target => ({ by: "role", role: ariaRole, name, ...options });

/** Target a button by its accessible name. */
export const button = (name: string, options?: { exact?: boolean }) =>
	role("button", name, options);

/** Target a link by its accessible name. */
export const link = (name: string, options?: { exact?: boolean }) =>
	role("link", name, options);

/** Target a heading by its text. */
export const heading = (name: string, options?: { exact?: boolean }) =>
	role("heading", name, options);

/** Target a form field by its label. */
export const field = (
	label: string,
	options: { exact?: boolean } = {},
): Target => ({ by: "label", label, ...options });

/** Target an element by its visible text. */
export const text = (
	content: string,
	options: { exact?: boolean } = {},
): Target => ({ by: "text", text: content, ...options });

/** Target an element by its `data-testid` attribute. */
export const testId = (id: string): Target => ({ by: "testId", testId: id });

/** Target an element by CSS selector. A last resort: it breaks easily and is flagged in reports. */
export const css = (selector: string): Target => ({ by: "css", selector });

/** Go to a path relative to the environment's base URL. */
export const visit = (path: Value) => located({ action: "visit", path });

/** Click an element. */
export const click = (target: Target) => located({ action: "click", target });

/** Type a value into a field, replacing what is there. */
export const fill = (target: Target, value: Value) =>
	located({ action: "fill", target, value });

/** Choose an option in a select field by its label or value. */
export const select = (target: Target, option: Value) =>
	located({ action: "select", target, option });

/** Tick (or untick) a checkbox or radio. */
export const check = (target: Target, checked = true) =>
	located({ action: "check", target, checked });

/** Press a keyboard key, optionally while focused on an element. */
export const press = (key: string, target?: Target) =>
	located({ action: "press", key, target });

/** Wait until an element is visible. */
export const waitFor = (target: Target) =>
	located({ action: "waitFor", target });

/** Run an axe accessibility scan on the current page and fail on violations. */
export const a11y = () => located({ action: "a11y" });

/** Assertions about the current page. These express what the journey proves. */
export const expect = {
	/** The page shows this text. */
	text: (content: Value) => located({ action: "expectText", text: content }),
	/** The element is visible. */
	visible: (target: Target) => located({ action: "expectVisible", target }),
	/** The current URL path matches (a trailing `*` matches any suffix). */
	url: (path: Value) => located({ action: "expectUrl", path }),
	/** The page title contains this text. */
	title: (title: Value) => located({ action: "expectTitle", title }),
	/** No console errors or uncaught exceptions happened during the journey so far. */
	noConsoleErrors: () => located({ action: "expectNoConsoleErrors" }),
};
