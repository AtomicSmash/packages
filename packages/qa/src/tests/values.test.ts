import { describe, expect, test } from "vitest";
import { describeValue, pathMatches, resolveValue } from "../runtime/values";

describe("resolveValue()", () => {
	const options = {
		data: { product: "/product/test" },
		environment: { QA_EMAIL: "qa@example.com" },
	};

	test("resolves literals, env and data", () => {
		expect(resolveValue("/shop", options)).toBe("/shop");
		expect(resolveValue({ env: "QA_EMAIL" }, options)).toBe("qa@example.com");
		expect(resolveValue({ data: "product" }, options)).toBe("/product/test");
	});

	test("explains missing values", () => {
		expect(() => resolveValue({ env: "NOPE" }, options)).toThrow(
			'Environment variable "NOPE" is not set',
		);
		expect(() => resolveValue({ data: "nope" }, options)).toThrow(
			'Test data "nope" is not defined',
		);
	});
});

test("describeValue() never reveals env values", () => {
	expect(describeValue({ env: "QA_PASSWORD" })).toBe("env(QA_PASSWORD)");
	expect(describeValue({ data: "product" })).toBe("data(product)");
	expect(describeValue("/shop")).toBe('"/shop"');
});

test("pathMatches()", () => {
	expect(pathMatches("/checkout/", "/checkout")).toBe(true);
	expect(pathMatches("/", "/")).toBe(true);
	expect(
		pathMatches("/checkout/order-received/123/", "/checkout/order-received/*"),
	).toBe(true);
	expect(pathMatches("/basket", "/checkout")).toBe(false);
});
