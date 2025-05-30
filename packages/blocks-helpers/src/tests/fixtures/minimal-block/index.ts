import type { Attributes } from "./attributes";
import type { Supports } from "./supports";
import { registerBlockType } from "@wordpress/blocks";
import blockMetaData from "./block.json";
import { Edit } from "./edit";
import { Save } from "./save";

registerBlockType<Supports, Attributes>(blockMetaData.name, {
	edit: Edit,
	save: Save,
});
