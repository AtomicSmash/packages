import type { BlockMetaData } from "@atomicsmash/blocks-helpers";

export type BlockJson = BlockMetaData<never, never>;

export function getBlockJsonScriptFields(blockJson: BlockJson) {
	const scriptFields = ["viewScript", "script", "editorScript"] as const;
	let result: Partial<Pick<BlockJson, (typeof scriptFields)[number]>> | null =
		null;
	for (const field of scriptFields) {
		if (Object.hasOwn(blockJson, field)) {
			result ??= {};
			result[field] = blockJson[field];
		}
	}
	return result;
}

export function getBlockJsonStyleFields(blockJson: BlockJson) {
	const styleFields = ["viewStyle", "style", "editorStyle"] as const;
	let result: Partial<Pick<BlockJson, (typeof styleFields)[number]>> | null =
		null;
	for (const field of styleFields) {
		if (Object.hasOwn(blockJson, field)) {
			result ??= {};
			result[field] = blockJson[field];
		}
	}
	return result;
}
