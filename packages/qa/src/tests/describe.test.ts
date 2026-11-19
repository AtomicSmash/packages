import { expect, test } from "vitest";
import { describeStep, describeTarget } from "../runtime/describe";

test("describeTarget() mirrors journey syntax", () => {
	expect(describeTarget({ by: "role", role: "button", name: "Buy" })).toBe(
		'button("Buy")',
	);
	expect(describeTarget({ by: "role", role: "banner" })).toBe('role("banner")');
	expect(describeTarget({ by: "label", label: "Email" })).toBe(
		'field("Email")',
	);
});

test("describeStep()", () => {
	expect(
		describeStep({
			action: "fill",
			target: { by: "label", label: "Email" },
			value: { env: "QA_EMAIL" },
		}),
	).toBe('fill field("Email") with env(QA_EMAIL)');
	expect(describeStep({ action: "expectNoConsoleErrors" })).toBe(
		"expect no console errors",
	);
});
