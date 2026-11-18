import type { Target } from "../types.js";
import { describeTarget } from "./describe.js";

/** An element read from a Playwright aria snapshot. */
export type AriaNode = { role: string; name?: string; text?: string };

/** An element on the failing page that the missing target may have become. */
export type Candidate = {
	role: string;
	name: string;
	score: number;
	target: Target;
	suggestion: string;
};

const FIELD_ROLES = new Set([
	"textbox",
	"searchbox",
	"combobox",
	"listbox",
	"checkbox",
	"radio",
	"spinbutton",
	"slider",
	"switch",
]);

/**
 * Parse the YAML-like output of Playwright's `ariaSnapshot()` into a flat list of elements.
 */
export function parseAriaSnapshot(snapshot: string): AriaNode[] {
	return snapshot.split("\n").flatMap((line) => {
		const match =
			/^\s*- ([\w-]+)(?: "((?:[^"\\]|\\.)*)")?(?: \[[^\]]*\])*(?::\s*(.*))?$/.exec(
				line,
			);
		if (!match?.[1]) {
			return [];
		}
		const text = match[3]?.trim().replace(/^"(.*)"$/, "$1");
		return [
			{
				role: match[1],
				...(match[2] === undefined
					? {}
					: { name: match[2].replace(/\\"/g, '"') }),
				...(text ? { text } : {}),
			},
		];
	});
}

/**
 * Score how alike two strings are from 0 to 1, using the best of bigram overlap, shared words and containment.
 */
export function similarity(a: string, b: string): number {
	const normalise = (value: string) =>
		value.toLowerCase().replace(/\s+/g, " ").trim();
	const [left, right] = [normalise(a), normalise(b)];
	if (left === right) {
		return 1;
	}
	if (!left || !right) {
		return 0;
	}
	const bigrams = (value: string) =>
		Array.from({ length: Math.max(value.length - 1, 0) }, (_, index) =>
			value.slice(index, index + 2),
		);
	const leftBigrams = bigrams(left);
	const rightBigrams = bigrams(right);
	const remaining = [...rightBigrams];
	const shared = leftBigrams.filter((bigram) => {
		const index = remaining.indexOf(bigram);
		if (index === -1) {
			return false;
		}
		remaining.splice(index, 1);
		return true;
	}).length;
	const dice = (2 * shared) / (leftBigrams.length + rightBigrams.length || 1);
	const leftWords = new Set(left.split(" "));
	const rightWords = right.split(" ");
	const wordOverlap =
		rightWords.filter((word) => leftWords.has(word)).length /
		Math.max(leftWords.size, rightWords.length);
	const isContained = left.includes(right) || right.includes(left);
	return (
		Math.round(Math.max(dice, wordOverlap, isContained ? 0.8 : 0) * 100) / 100
	);
}

/**
 * Turn a snapshot element into the target that would find it, preferring role-based targets.
 */
function toTarget(node: { role: string; name: string }): Target {
	return FIELD_ROLES.has(node.role)
		? { by: "label", label: node.name }
		: { by: "role", role: node.role, name: node.name };
}

/**
 * Find elements on the failing page that a missing target has most likely become.
 * Only role, label and text targets can be matched; test IDs and CSS selectors are not in the snapshot.
 */
export function findCandidates(
	target: Target,
	nodes: AriaNode[],
	limit = 5,
): Candidate[] {
	const named = nodes
		.map((node) => ({
			role: node.role,
			name: node.name ?? node.text ?? "",
			isTextOnly: node.name === undefined,
		}))
		.filter((node) => node.name);

	const scored = named.flatMap((node) => {
		switch (target.by) {
			case "role": {
				if (target.name === undefined) {
					return [];
				}
				const score = similarity(target.name, node.name);
				const threshold = node.role === target.role ? 0.4 : 0.8;
				return score >= threshold ? [{ node, score }] : [];
			}
			case "label": {
				const score = similarity(target.label, node.name);
				const threshold = FIELD_ROLES.has(node.role) ? 0.4 : 0.8;
				return score >= threshold ? [{ node, score }] : [];
			}
			case "text": {
				const score = similarity(target.text, node.name);
				return score >= 0.5 ? [{ node, score }] : [];
			}
			default:
				return [];
		}
	});

	const seen = new Set<string>();
	return scored
		.sort((a, b) => b.score - a.score)
		.flatMap(({ node, score }) => {
			const candidateTarget: Target = node.isTextOnly
				? { by: "text", text: node.name }
				: toTarget(node);
			const suggestion = describeTarget(candidateTarget);
			if (seen.has(suggestion)) {
				return [];
			}
			seen.add(suggestion);
			return [
				{
					role: node.role,
					name: node.name,
					score,
					target: candidateTarget,
					suggestion,
				},
			];
		})
		.slice(0, limit);
}
