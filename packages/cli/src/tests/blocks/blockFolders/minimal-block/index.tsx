import type { Attributes } from "./attributes";
import type { Supports } from "./supports";
import { registerBlockType } from "@wordpress/blocks";
// import { Icon } from "@blocks/svgs";
import blockMetaData from "./block.json";
import { Edit } from "./edit";
import { save } from "./save";

registerBlockType<Supports, Attributes>(blockMetaData.name, {
	// icon: <Icon iconName="" />,
	edit: Edit,
	save: save({ hasInnerBlocks: true }),
});
