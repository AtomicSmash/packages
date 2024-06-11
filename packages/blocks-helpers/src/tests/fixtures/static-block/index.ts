import type { InterpretedAttributes } from "./attributes";
import type { InterpretedUsedContext } from "./context";
import { registerBlockType } from "@atomicsmash/blocks-helpers";
import blockMetaData from "./block.json";
import { deprecated } from "./deprecation";
import { Edit } from "./edit";
import { Save } from "./save";
import { transforms } from "./transforms";

export { type InterpretedProvidesContext } from "./context";

registerBlockType<InterpretedAttributes, InterpretedUsedContext>(
	blockMetaData.name,
	{
		deprecated,
		edit: Edit,
		save: Save,
		transforms,
	},
);
