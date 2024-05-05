import { registerBlockType } from "@atomicsmash/blocks-helpers";
import { type Attributes } from "./attributes";
import blockMetaData from "./block.json";
import { Edit } from "./edit";
import { Save } from "./save";
import { type Supports } from "./supports";

registerBlockType<Supports, Attributes>(blockMetaData.name, {
	edit: Edit,
	save: Save,
});
