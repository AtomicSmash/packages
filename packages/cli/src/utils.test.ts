import { expect, test, describe } from "vitest";
import { toCamelCase } from "./utils.js";

describe.concurrent("CLI utils work as intended", () => {
	test("toCamelCase", () => {
		expect(toCamelCase("test-string")).toBe("testString");
		expect(toCamelCase("test string")).toBe("testString");
		expect(toCamelCase("test_string")).toBe("testString");
		expect(toCamelCase("teststring")).toBe("teststring");
		expect(toCamelCase("1test-string1")).toBe("1testString1");
		expect(toCamelCase("1test-1string1")).toBe("1test1string1");
	});
});
