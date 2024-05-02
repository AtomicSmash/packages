import { BlockAttributes } from "@atomicsmash/blocks-helpers";

export const attributes = {
	url: {
		type: "string",
	},
} satisfies BlockAttributes<"dynamic">;
export type Attributes = typeof attributes;
