import type { DefaultAttributes } from "@atomicsmash/blocks-helpers";

let defaultAttributes: Record<string, unknown>;
defaultAttributes = {
	// Class name is only present in attributes if the value is explicitly set.
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	className: "a_string",
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	// @ts-expect-error className should not be present when customClassName is unsupported.
	className: "a_string",
} as const satisfies DefaultAttributes<{ customClassName: false }>;
