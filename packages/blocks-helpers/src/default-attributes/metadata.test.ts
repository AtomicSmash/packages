import type { DefaultAttributes } from "@atomicsmash/blocks-helpers";

let defaultAttributes: Record<string, unknown>;
defaultAttributes = {
	// Metadata may not be present if it has no changed values (e.g. it has not been renamed)
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	metadata: {
		name: "Custom block name",
	},
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	metadata: {
		name: "Custom block name",
	},
} as const satisfies DefaultAttributes<{ renaming: true }>;
defaultAttributes = {
	// @ts-expect-error metadata with name should not be present when renaming is unsupported.
	metadata: {
		name: "Custom block name",
	},
} as const satisfies DefaultAttributes<{ renaming: false }>;
