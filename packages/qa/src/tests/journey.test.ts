import { describe, expect, test } from "vitest";
import {
	button,
	click,
	data,
	env,
	expect as assert,
	field,
	fill,
	journey,
	visit,
} from "../journey";

describe("journey builders", () => {
	test("steps are plain data with the caller's source location", () => {
		const step = click(button("Add to basket"));
		expect(step).toMatchObject({
			action: "click",
			target: { by: "role", role: "button", name: "Add to basket" },
			location: { file: expect.stringContaining("journey.test.ts") as string },
		});
		expect(step.location?.line).toBeGreaterThan(0);
	});

	test("journey records the file it was defined in", () => {
		expect(journey({ name: "Homepage", steps: [] }).location).toMatchObject({
			file: expect.stringContaining("journey.test.ts") as string,
		});
	});

	test("journey keeps steps in order with env and data references", () => {
		const definition = journey({
			name: "Checkout",
			mutates: true,
			steps: [
				visit(data("product")),
				fill(field("Email address"), env("QA_EMAIL")),
				assert.text("Order received"),
			],
		});
		expect(
			definition.steps.map(({ location: _location, ...step }) => step),
		).toEqual([
			{ action: "visit", path: { data: "product" } },
			{
				action: "fill",
				target: { by: "label", label: "Email address" },
				value: { env: "QA_EMAIL" },
			},
			{ action: "expectText", text: "Order received" },
		]);
	});
});
