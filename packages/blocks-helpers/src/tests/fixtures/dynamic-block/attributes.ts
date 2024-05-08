import type {
	BlockAttributes,
	InterpretAttributes,
} from "@atomicsmash/blocks-helpers";

export const attributes = {
	title: {
		type: "string",
	},
	size: {
		type: "string",
		enum: ["small", "large"],
		default: "small",
	},
	align: {
		type: "string",
		default: "none",
	},
} as const satisfies BlockAttributes<"dynamic">;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Attributes>;
