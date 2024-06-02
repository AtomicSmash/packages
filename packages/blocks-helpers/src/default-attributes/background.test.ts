/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DefaultAttributes } from "@atomicsmash/blocks-helpers";

let defaultAttributes: Record<string, unknown>;
defaultAttributes = {
	// Align is only present in attributes if the value is explicitly set.
} as const satisfies DefaultAttributes<{
	background: {
		backgroundImage: true;
		backgroundSize: true;
	};
}>;
defaultAttributes = {
	// @ts-expect-error Align should not be present when align is unsupported.
	align: "left",
} as const satisfies DefaultAttributes<{ align: false }>;
