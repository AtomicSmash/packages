import { normaliseStagingURL } from "../utils/normaliseStagingURL";
import { expect, test } from "vitest";

test("normaliseStagingURL()", () => {
	expect(normaliseStagingURL("https://www.google.com/")).toBe("www.google.com");
	expect(normaliseStagingURL("https://www.google.com")).toBe("www.google.com");
	expect(normaliseStagingURL("//www.google.com/")).toBe("www.google.com");
	expect(normaliseStagingURL("//www.google.com")).toBe("www.google.com");
	expect(normaliseStagingURL("www.google.com/")).toBe("www.google.com");
	expect(normaliseStagingURL("www.google.com")).toBe("www.google.com");
});
