import type {
	BlockAttributes,
	InterpretAttributes,
} from "@atomicsmash/blocks-helpers";

export const attributes = {
	title: {
		type: "string",
		selector: ".title",
		source: "html",
	},
	size: {
		enum: ["small", "large"],
		default: "small",
	},
	align: {
		type: "string",
		default: "none",
	},
} as const satisfies BlockAttributes<"static">;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Attributes>;
