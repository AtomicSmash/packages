import { registerBlockType } from "@atomicsmash/blocks-helpers";
import { type Attributes } from "./attributes";
import blockMetaData from "./block.json";
import { type InterpretedUsedContext } from "./context";
import { deprecated } from "./deprecation";
import { Edit } from "./edit";
import { Save } from "./save";
import { type Supports } from "./supports";
import { transforms } from "./transforms";

export { type InterpretedProvidesContext } from "./context";

registerBlockType<Supports, Attributes, InterpretedUsedContext>(
	blockMetaData.name,
	{
		deprecated,
		edit: Edit,
		save: Save,
		transforms,
	},
);
