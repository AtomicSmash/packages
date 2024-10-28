import type { DefaultAttributes } from "@atomicsmash/blocks-helpers";

const validBackgroundValue = {
	backgroundImage: {
		url: "string",
		id: 0,
		source: "string",
		title: "string",
	},
	backgroundPosition: "string",
};
const validSpacingValue = {
	margin: {
		bottom: "string",
		left: "string",
		right: "string",
		top: "string",
	},
	padding: {
		bottom: "string",
		left: "string",
		right: "string",
		top: "string",
	},
	blockGap: "string",
};

let defaultAttributes: Record<string, unknown>;
defaultAttributes = {
	// Style is only present in attributes if the value is explicitly set in the editor.
} as const satisfies DefaultAttributes<{
	spacing: {
		margin: true;
		padding: true;
		blockGap: true;
	};
}>;

defaultAttributes = {
	// @ts-expect-error Style should not be present when no style related properties are unsupported.
	style: {},
} as const satisfies DefaultAttributes<Record<string, never>>;

/* Background */
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
defaultAttributes = {
	style: {
		// Spacing possible when combined with other style attributes
		background: validBackgroundValue,
	},
} as const satisfies DefaultAttributes<{
	background: {
		backgroundImage: true;
		backgroundSize: true;
	};
	spacing: {
		margin: true;
		padding: true;
		blockGap: true;
	};
}>;

/* Spacing */
defaultAttributes = {
	// @ts-expect-error Spacing should not be present when spacing is unsupported.
	style: {
		spacing: {},
	},
} as const satisfies DefaultAttributes<{
	spacing: {
		margin: false;
		padding: false;
		blockGap: false;
	};
}>;
defaultAttributes = {
	style: {
		// Spacing possible when combined with other style attributes
		spacing: validSpacingValue,
	},
} as const satisfies DefaultAttributes<{
	background: {
		backgroundImage: true;
		backgroundSize: true;
	};
	spacing: {
		margin: true;
		padding: true;
		blockGap: true;
	};
}>;
