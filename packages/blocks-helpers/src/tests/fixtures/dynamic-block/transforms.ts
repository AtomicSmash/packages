import type { InterpretedAttributes } from "./attributes";
import type { BlockTransforms } from "@atomicsmash/blocks-helpers";

export const transforms = {
	from: [],
	to: [],
} satisfies {
	from: BlockTransforms<InterpretedAttributes>;
	to: BlockTransforms<InterpretedAttributes>;
};
