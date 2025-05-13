import type { InterpretedAttributes } from "./attributes";
import { registerBlockType } from "@atomicsmash/blocks-helpers";
import blockMetaData from "./block.json";
import { Edit } from "./edit";
import { Save } from "./save";

registerBlockType<InterpretedAttributes>(blockMetaData.name, {
	edit: Edit,
	save: Save,
});
