import { describe, expect, test } from "vitest";
import {
	findCandidates,
	parseAriaSnapshot,
	similarity,
} from "../runtime/candidates";

const snapshot = `- banner:
  - link "Home"
  - navigation "Main":
    - link "Shop"
- main:
  - heading "Hoodie" [level=1]
  - paragraph: Soft cotton hoodie
  - textbox "Email address"
  - button "Add to cart"
  - button "Add to wishlist"
  - text: "In stock"`;

test("parseAriaSnapshot()", () => {
	expect(parseAriaSnapshot(snapshot)).toEqual([
		{ role: "banner" },
		{ role: "link", name: "Home" },
		{ role: "navigation", name: "Main" },
		{ role: "link", name: "Shop" },
		{ role: "main" },
		{ role: "heading", name: "Hoodie" },
		{ role: "paragraph", text: "Soft cotton hoodie" },
		{ role: "textbox", name: "Email address" },
		{ role: "button", name: "Add to cart" },
		{ role: "button", name: "Add to wishlist" },
		{ role: "text", text: "In stock" },
	]);
});

test("similarity()", () => {
	expect(similarity("Add to basket", "add to basket")).toBe(1);
	expect(similarity("Email", "Email address")).toBe(0.8);
	expect(similarity("Add to basket", "Log out")).toBeLessThan(0.3);
});

describe("findCandidates()", () => {
	const nodes = parseAriaSnapshot(snapshot);

	test("suggests a renamed button", () => {
		const [best] = findCandidates(
			{ by: "role", role: "button", name: "Add to basket" },
			nodes,
		);
		expect(best).toMatchObject({ suggestion: 'button("Add to cart")' });
	});

	test("suggests a relabelled field", () => {
		expect(
			findCandidates({ by: "label", label: "Your email" }, nodes)[0],
		).toMatchObject({ suggestion: 'field("Email address")' });
	});

	test("suggests changed text", () => {
		expect(
			findCandidates({ by: "text", text: "Soft cotton hoody" }, nodes)[0],
		).toMatchObject({ suggestion: 'text("Soft cotton hoodie")' });
	});

	test("returns nothing when nothing is similar", () => {
		expect(
			findCandidates(
				{ by: "role", role: "button", name: "Place order" },
				nodes,
			),
		).toEqual([]);
	});
});
