import { BlockTransforms } from "@atomicsmash/blocks-helpers";
import { type Attributes } from "./attributes";
import { type Supports } from "./supports";

export const transforms = {
	from: [],
	to: [],
} satisfies {
	from: BlockTransforms<Supports, Attributes>;
	to: BlockTransforms<Supports, Attributes>;
};
