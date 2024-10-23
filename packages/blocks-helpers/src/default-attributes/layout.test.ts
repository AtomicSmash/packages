import type { DefaultAttributes } from "@atomicsmash/blocks-helpers";

let defaultAttributes: Record<string, unknown>;
defaultAttributes = {} as const satisfies DefaultAttributes<{ layout: true }>;
defaultAttributes = {
	// @ts-expect-error Layout should not be present when layout is unsupported.
	layout: { type: "default" },
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	// @ts-expect-error Layout should not be present when layout is unsupported.
	layout: { type: "default" },
} as const satisfies DefaultAttributes<{ layout: false }>;
