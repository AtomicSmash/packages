import type { BlockMetaData } from "@atomicsmash/blocks-helpers";
import type { ExecException } from "node:child_process";
import { exec } from "node:child_process";

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

export async function execute(
	command: string,
	options: { debug: boolean } = { debug: false },
) {
	return new Promise<{
		error: ExecException | null;
		stdout: string;
		stderr: string;
	}>((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				if (options.debug) {
					console.error({ error, stdout, stderr });
				}
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- This is preferred in this instance
				reject({ error, stdout, stderr });
			}
			resolve({ error, stdout, stderr });
		});
	});
}
