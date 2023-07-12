/**
 * NOTE: For all tests, the timezone is set to Europe/Istanbul to get a
 * timezone offset that doesn't change due to daylight savings.
 * This allows us to set static values for expected values without
 * them failing for half a year each year.
 * The Timezone offset is UTC+3.
 * ...
 * https://youtu.be/5rHRd6Cl-tQ?t=32
 */
import { expect, it, describe } from "vitest";
import { DatePHP } from "../index.js";
import {
	escapeAllCharacters,
	unslash,
	replaceAllUnescaped,
	searchFirstUnescaped,
} from "../utils.js";
// spell-checker:disable
describe("Test Env Checks", () => {
	it("should always be GMT+1 (same as BST)", () => {
		expect(new Date().getTimezoneOffset()).toBe(-180);
	});
});
describe.concurrent("DatePHP.format()", () => {
	it("returns expected day values for a set date", () => {
		const date = new DatePHP(1996, 5, 5, 12, 34, 2); // Wednesday 5th June 1996 12:34:02
		expect(date.format("")).toBe("");
		expect(date.format("d")).toBe("05");
		expect(date.format("D")).toBe("Wed");
		expect(date.format("j")).toBe("5");
		expect(date.format("l")).toBe("Wednesday");
		expect(date.format("N")).toBe("3");
		expect(date.format("S")).toBe("th");
		expect(date.format("w")).toBe("3");
		expect(date.format("z")).toBe("156");
	});
	it("returns expected week values for a set date", () => {
		const date = new DatePHP(1996, 5, 5, 12, 34, 2); // Wednesday 5th June 1996 12:34:02
		expect(date.format("W")).toBe("W");
	});
	it("returns expected month values for a set date", () => {
		const date = new DatePHP(1996, 5, 5, 12, 34, 2); // Wednesday 5th June 1996 12:34:02
		expect(date.format("F")).toBe("June");
		expect(date.format("m")).toBe("06");
		expect(date.format("M")).toBe("Jun");
		expect(date.format("n")).toBe("6");
		expect(date.format("t")).toBe("30");
	});
	it("returns expected year values for a set date", () => {
		const date = new DatePHP(1996, 5, 5, 12, 34, 2); // Wednesday 5th June 1996 12:34:02
		expect(date.format("L")).toBe("1");
		expect(date.format("o")).toBe("o");
		expect(date.format("Y")).toBe("1996");
		expect(date.format("y")).toBe("96");
	});
	it("returns expected time values for a set date", () => {
		const date = new DatePHP(1996, 5, 5, 13, 34, 2); // Wednesday 5th June 1996 12:34:02
		expect(date.format("a")).toBe("pm");
		expect(date.format("A")).toBe("PM");
		expect(date.format("g")).toBe("1");
		expect(date.format("G")).toBe("13");
		expect(date.format("h")).toBe("01");
		expect(date.format("H")).toBe("13");
		expect(date.format("i")).toBe("34");
		expect(date.format("s")).toBe("02");
		expect(date.format("v")).toBe("000");

		expect(date.format("B")).toBe("B");
		expect(date.format("u")).toBe("u");
	});
	it("returns expected timezone values for a set date", () => {
		const date = new DatePHP(1996, 5, 5, 12, 34, 2); // Wednesday 5th June 1996 12:34:02
		expect(date.format("e")).toBe("e");
		expect(date.format("I")).toBe("I");
		expect(date.format("O")).toBe("+0300");
		expect(date.format("P")).toBe("+03:00");
		expect(date.format("p")).toBe("+03:00");
		expect(date.format("T")).toBe("T");
		expect(date.format("Z")).toBe("Z");
	});
	it("returns expected full date/time values for a set date", () => {
		const date = new DatePHP(1996, 5, 5, 12, 34, 2); // Wednesday 5th June 1996 12:34:02
		// Full date/time
		expect(date.format("c")).toBe("1996-06-05T12:34:02+03:00");
		expect(date.format("r")).toBe("Wed, 05 Jun 1996 12:34:02 +0300");
		expect(date.format("U")).toBe("833967242");
	});
	it("uses the correct ordinals in edge cases", () => {
		let date = new DatePHP(1996, 5, 1, 12, 34, 2); // Saturday 1st June 1996 12:34:02
		expect(date.format("S")).toBe("st");
		date = new DatePHP(1996, 5, 2, 12, 34, 2); // Sunday 2nd June 1996 12:34:02
		expect(date.format("S")).toBe("nd");
		date = new DatePHP(1996, 5, 3, 12, 34, 2); // Monday 3rd June 1996 12:34:02
		expect(date.format("S")).toBe("rd");
		date = new DatePHP(1996, 5, 11, 12, 34, 2); // Tuesday 11th June 1996 12:34:02
		expect(date.format("S")).toBe("th");
		date = new DatePHP(1996, 5, 12, 12, 34, 2); // Wednesday 12th June 1996 12:34:02
		expect(date.format("S")).toBe("th");
		date = new DatePHP(1996, 5, 13, 12, 34, 2); // Thursday 13th June 1996 12:34:02
		expect(date.format("S")).toBe("th");
		date = new DatePHP(1996, 5, 21, 12, 34, 2); // Friday 21st June 1996 12:34:02
		expect(date.format("S")).toBe("st");
		date = new DatePHP(1996, 5, 22, 12, 34, 2); // Saturday 22nd June 1996 12:34:02
		expect(date.format("S")).toBe("nd");
		date = new DatePHP(1996, 5, 23, 12, 34, 2); // Sunday 23rd June 1996 12:34:02
		expect(date.format("S")).toBe("rd");
	});
	it("uses the correct day number if is a Sunday", () => {
		const date = new DatePHP(1996, 5, 23, 12, 34, 2); // Sunday 23rd June 1996 12:34:02
		expect(date.format("N")).toBe("7");
		expect(date.format("w")).toBe("0");
	});
	it("doesn't convert escaped characters", () => {
		const date = new DatePHP(1996, 5, 23, 12, 34, 2); // Sunday 23rd June 1996 12:34:02
		expect(
			date.format(
				escapeAllCharacters("dDjlNSwzWFmMntLoYyaABgGhHisuveIOPpTZcrU"),
			),
		).toBe("dDjlNSwzWFmMntLoYyaABgGhHisuveIOPpTZcrU");
	});
	it("checks meridiems work in the morning", () => {
		const date = new DatePHP(1996, 5, 23, 9, 34, 2); // Sunday 23rd June 1996 9:34:02
		expect(date.format("a")).toBe("am");
		expect(date.format("A")).toBe("AM");
	});
	it("January bug - 6th April 22", () => {
		const date = new DatePHP(2022, 0, 1, 9, 34, 2); // Saturday 1st January 2022 9:34:02
		// Check escape function
		expect(escapeAllCharacters("January")).toBe("\\J\\a\\n\\u\\a\\r\\y");
		// Check unslash function
		expect(unslash("\\J\\a\\n\\u\\a\\r\\y")).toBe("January");
		// Check correct date number
		expect(date.getMonth()).toBe(0);
		// Check search first unescaped function returns nothing for escaped January
		expect(searchFirstUnescaped(escapeAllCharacters("January"), "J")).toBe(-1);
		expect(searchFirstUnescaped(escapeAllCharacters("January"), "a")).toBe(-1);
		expect(searchFirstUnescaped(escapeAllCharacters("January"), "n")).toBe(-1);
		expect(searchFirstUnescaped(escapeAllCharacters("January"), "u")).toBe(-1);
		expect(searchFirstUnescaped(escapeAllCharacters("January"), "r")).toBe(-1);
		expect(searchFirstUnescaped(escapeAllCharacters("January"), "y")).toBe(-1);
		// Check replace unescaped a with TEST
		expect(
			unslash(replaceAllUnescaped(escapeAllCharacters("January"), "a", "TEST")),
		).toBe("January");
		// Check final result
		expect(date.format("F")).toBe("January");
		expect(date.format("F Y")).toBe("January 2022");
	});
});
describe.concurrent("DatePHP.parseString()", () => {
	it("Parses date in Y-m-d\\TH:i:s.vp format", () => {
		const dateString = "2022-11-21T14:56:34.000Z";
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getUTCFullYear(),
		).toBe(2022);
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getUTCMonth(),
		).toBe(10);
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getUTCDate(),
		).toBe(21);
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getUTCHours(),
		).toBe(14);
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getUTCMinutes(),
		).toBe(56);
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getUTCSeconds(),
		).toBe(34);
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getFullYear(),
		).toBe(2022);
		expect(DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getMonth()).toBe(
			10,
		);
		expect(DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getDate()).toBe(
			21,
		);
		expect(DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getHours()).toBe(
			17,
		);
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getMinutes(),
		).toBe(56);
		expect(
			DatePHP.parseString(dateString, "Y-m-d\\TH:i:s.vp").getSeconds(),
		).toBe(34);
	});
	it("formats and parses a date back into the same date", () => {
		const date = new DatePHP(2022, 0, 1, 9, 34, 2); // Saturday 1st January 2022 9:34:02
		expect(
			DatePHP.parseString(
				date.format("Y-m-d\\TH:i:s.vp"),
				"Y-m-d\\TH:i:s.vp",
			).getTime(),
		).toBe(date.getTime());
	});
	it("formats and parses a date in UTC timezone back into the same date", () => {
		const date = new DatePHP(Date.UTC(2022, 0, 1, 9, 34, 2)); // Saturday 1st January 2022 9:34:02
		expect(
			DatePHP.parseString(
				date.format("Y-m-d\\TH:i:s.vp"),
				"Y-m-d\\TH:i:s.vp",
			).getTime(),
		).toBe(date.getTime());
	});
});
// spell-checker:enable
