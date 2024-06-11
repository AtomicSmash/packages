import type { InterpretedAttributes } from "./attributes";
import { BlockTransforms } from "@atomicsmash/blocks-helpers";

export const transforms = {
	from: [],
	to: [],
} satisfies {
	from: BlockTransforms<InterpretedAttributes>;
	to: BlockTransforms<InterpretedAttributes>;
};
