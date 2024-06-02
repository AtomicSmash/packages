/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DefaultAttributes } from "@atomicsmash/blocks-helpers";

let defaultAttributes: Record<string, unknown>;
defaultAttributes = {
	// Background is only present in attributes if the value is explicitly set in the editor.
} as const satisfies DefaultAttributes<{
	background: {
		backgroundImage: true;
		backgroundSize: true;
	};
}>;
defaultAttributes = {
	// @ts-expect-error Background should not be present when background is unsupported.
	style: {
		background: {},
	},
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	// @ts-expect-error Background should not be present when background is unsupported.
	style: {
		background: {},
	},
} as const satisfies DefaultAttributes<{
	background: {
		backgroundImage: false;
		backgroundSize: false;
	};
}>;
