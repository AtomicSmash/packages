import { normaliseLocalURL } from "../utils/normaliseLocalURL";
import { expect, test } from "vitest";

test("normaliseLocalURL()", () => {
	expect(normaliseLocalURL("https://site.test/")).toBe("https://site.test");
	expect(normaliseLocalURL("http://site.test")).toBe("http://site.test");
	expect(normaliseLocalURL("//site.test/")).toBe("https://site.test");
	expect(normaliseLocalURL("site.test")).toBe("https://site.test");
	expect(normaliseLocalURL("http://localhost:8080/")).toBe(
		"http://localhost:8080",
	);
});
