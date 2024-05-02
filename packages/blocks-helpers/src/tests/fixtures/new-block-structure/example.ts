import {
	type BlockSupports,
	type BlockAttributes,
	type InterpretAttributes,
	type DefaultAttributes,
} from "@atomicsmash/blocks-helpers";
import { createBlock } from "@wordpress/blocks";
import { type Attributes } from "./attributes";
import { type Supports } from "./supports";

export const example = {} satisfies BlockExample<Supports, Attributes>;

type BlockInstance = ReturnType<typeof createBlock>;

export type InnerBlocks = {
	name: BlockInstance["name"];
	attributes: BlockInstance["attributes"];
	innerBlocks?: InnerBlocks[];
};

export type BlockExample<
	Supports extends BlockSupports,
	Attributes extends BlockAttributes<"dynamic">,
> = {
	viewportWidth?: number;
	attributes?: InterpretAttributes<Attributes> &
		InterpretAttributes<DefaultAttributes<Supports>>;
	innerBlocks?: InnerBlocks[];
};
