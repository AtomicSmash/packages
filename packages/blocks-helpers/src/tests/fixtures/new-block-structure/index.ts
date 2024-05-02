import { registerBlockType } from "@atomicsmash/blocks-helpers";
import { type Attributes, attributes } from "./attributes";
import blockMetaData from "./block.json";
import {
	providesContext,
	usesContext,
	type InterpretedUsedContext,
} from "./context";
import { deprecated } from "./deprecation";
import { Edit } from "./edit";
import { example } from "./example";
import { type Supports, supports } from "./supports";
import { transforms } from "./transforms";

export { type InterpretedProvidesContext } from "./context";

registerBlockType<Supports, Attributes, InterpretedUsedContext>(
	blockMetaData.name,
	{
		attributes,
		supports,
		deprecated,
		example,
		providesContext,
		usesContext,
		edit: Edit,
		transforms,
	},
);
