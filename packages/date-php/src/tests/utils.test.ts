/**
 * NOTE: For all tests, the timezone is set to Europe/Istanbul to get a
 * timezone offset that doesn't change due to daylight savings.
 * This allows us to set static values for expected values without
 * them failing for half a year each year.
 * The Timezone offset is UTC+3.
 * ...
 * https://youtu.be/5rHRd6Cl-tQ?t=32
 */
import { expect, test } from "vitest";
import {
	escapeAllCharacters,
	unslash,
	replaceAllUnescaped,
	searchFirstUnescaped,
} from "../utils.js";
// spell-checker:disable
test("escapeAllCharacters()", () => {
	expect(escapeAllCharacters("abcdef")).toBe("\\a\\b\\c\\d\\e\\f");
	expect(escapeAllCharacters("abc\\def")).toBe("\\a\\b\\c\\\\\\d\\e\\f");
});
test("unslash()", () => {
	expect(unslash("\\a\\b\\c\\d\\e\\f")).toBe("abcdef");
	expect(unslash("abc\\\\def")).toBe("abc\\def");
	expect(unslash("abc\\\\\\\\def")).toBe("abc\\\\def");
	expect(unslash("abc\\\\\\def")).toBe("abc\\def");
});
test("replaceAllUnescaped()", () => {
	expect(replaceAllUnescaped("abcdef", "g", "h")).toBe("abcdef");
	expect(replaceAllUnescaped("abcdef", "b", "h")).toBe("ahcdef");
	expect(replaceAllUnescaped("a\\bcdef", "b", "h")).toBe("a\\bcdef");
	expect(replaceAllUnescaped("a\\\\bcdef", "b", "h")).toBe("a\\\\hcdef");
});
test("searchFirstUnescaped()", () => {
	expect(searchFirstUnescaped("abcdef", "g")).toBe(-1);
	expect(searchFirstUnescaped("abcdef", "b")).toBe(1);
	expect(searchFirstUnescaped("a\\bcdef", "b")).toBe(-1);
	expect(searchFirstUnescaped("a\\\\bcdef", "b")).toBe(3);
});
// spell-checker:enable
