import type { Supports } from "./supports";
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
		type: "string",
		enum: ["small", "large"],
		default: "small",
	},
	align: {
		type: "string",
		default: false,
	},
} as const satisfies BlockAttributes;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Supports, Attributes>;
