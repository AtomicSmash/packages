import type { DefaultAttributes } from "@atomicsmash/blocks-helpers";

let defaultAttributes: Record<string, unknown>;
defaultAttributes = {
	// Lock is only present in attributes if the value is explicitly set.
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	lock: { move: true, remove: true },
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	// @ts-expect-error lock should not be present when lock is unsupported.
	lock: { move: true, remove: true },
} as const satisfies DefaultAttributes<{ lock: false }>;
