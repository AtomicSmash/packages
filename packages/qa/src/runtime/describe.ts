import type { Step, Target } from "../types.js";
import { describeValue } from "./values.js";

const SHORTHAND_ROLES = new Set(["button", "link", "heading"]);

/**
 * Describe a target in the same form it is written in a journey file, e.g. `button("Add to basket")`.
 */
export function describeTarget(target: Target): string {
	switch (target.by) {
		case "role":
			return SHORTHAND_ROLES.has(target.role) && target.name !== undefined
				? `${target.role}("${target.name}")`
				: `role("${target.role}"${target.name === undefined ? "" : `, "${target.name}"`})`;
		case "label":
			return `field("${target.label}")`;
		case "text":
			return `text("${target.text}")`;
		case "testId":
			return `testId("${target.testId}")`;
		case "css":
			return `css("${target.selector}")`;
	}
}

/**
 * Describe a step in a short, human-readable form for test step titles and reports.
 */
export function describeStep(step: Step): string {
	switch (step.action) {
		case "visit":
			return `visit ${describeValue(step.path)}`;
		case "click":
			return `click ${describeTarget(step.target)}`;
		case "fill":
			return `fill ${describeTarget(step.target)} with ${describeValue(step.value)}`;
		case "select":
			return `select ${describeValue(step.option)} in ${describeTarget(step.target)}`;
		case "check":
			return `${step.checked ? "check" : "uncheck"} ${describeTarget(step.target)}`;
		case "press":
			return `press "${step.key}"${step.target ? ` in ${describeTarget(step.target)}` : ""}`;
		case "waitFor":
			return `wait for ${describeTarget(step.target)}`;
		case "expectText":
			return `expect text ${describeValue(step.text)}`;
		case "expectVisible":
			return `expect visible ${describeTarget(step.target)}`;
		case "expectUrl":
			return `expect url ${describeValue(step.path)}`;
		case "expectTitle":
			return `expect title ${describeValue(step.title)}`;
		case "expectNoConsoleErrors":
			return "expect no console errors";
		case "a11y":
			return "accessibility scan";
	}
}

/**
 * Whether a step is an assertion, i.e. part of what the journey proves rather than how it gets there.
 */
export const isAssertion = (step: Step): boolean =>
	step.action.startsWith("expect") || step.action === "a11y";
