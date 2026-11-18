import type { Step, Target } from "../types.js";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { pathMatches, resolveValue } from "./values.js";

/** What a step needs from the run besides the page. */
export type StepContext = {
	data: Record<string, string>;
	consoleErrors: readonly string[];
};

/**
 * Turn a journey target into a Playwright locator.
 */
export function toLocator(page: Page, target: Target): Locator {
	switch (target.by) {
		case "role":
			return page.getByRole(
				target.role as Parameters<Page["getByRole"]>[0],
				target.name === undefined
					? {}
					: { name: target.name, exact: target.exact },
			);
		case "label":
			return page.getByLabel(target.label, { exact: target.exact });
		case "text":
			return page.getByText(target.text, { exact: target.exact });
		case "testId":
			return page.getByTestId(target.testId);
		case "css":
			return page.locator(target.selector);
	}
}

/**
 * Run one journey step against the page.
 */
export async function executeStep(
	page: Page,
	step: Step,
	context: StepContext,
): Promise<void> {
	const value = (input: Parameters<typeof resolveValue>[0]) =>
		resolveValue(input, { data: context.data });

	switch (step.action) {
		case "visit": {
			const response = await page.goto(value(step.path));
			if (response && response.status() >= 400) {
				throw new Error(
					`Navigation to ${page.url()} returned HTTP ${response.status().toString()}`,
				);
			}
			return;
		}
		case "click":
			return toLocator(page, step.target).click();
		case "fill":
			return toLocator(page, step.target).fill(value(step.value));
		case "select":
			await toLocator(page, step.target).selectOption(value(step.option));
			return;
		case "check":
			return toLocator(page, step.target).setChecked(step.checked);
		case "press":
			return step.target
				? toLocator(page, step.target).press(step.key)
				: page.keyboard.press(step.key);
		case "waitFor":
			return toLocator(page, step.target).waitFor({ state: "visible" });
		case "expectText":
			return expect(page.getByText(value(step.text)).first()).toBeVisible();
		case "expectVisible":
			return expect(toLocator(page, step.target)).toBeVisible();
		case "expectUrl": {
			const expected = value(step.path);
			await expect
				.poll(() => pathMatches(new URL(page.url()).pathname, expected), {
					message: `expected URL path to match "${expected}"`,
				})
				.toBe(true);
			return;
		}
		case "expectTitle":
			return expect(page).toHaveTitle(
				new RegExp(value(step.title).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
			);
		case "expectNoConsoleErrors":
			expect(
				context.consoleErrors,
				"expected no console errors during the journey",
			).toEqual([]);
			return;
		case "a11y": {
			const { checkAccessibility } = await import("@atomicsmash/test-utils");
			const violations = await checkAccessibility(page);
			expect(
				violations.map(({ id, help }) => `${id}: ${help}`),
				"expected no accessibility violations",
			).toEqual([]);
			return;
		}
	}
}
