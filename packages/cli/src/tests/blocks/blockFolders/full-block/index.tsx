import type { Attributes } from "./attributes";
import type { InterpretedUsedContext } from "./context";
import type { Supports } from "./supports";
import { registerBlockType, registerBlockVariation } from "@wordpress/blocks";
// import { Icon } from "@blocks/svgs";
import blockMetaData from "./block.json";
import { deprecated } from "./deprecation";
import { Edit } from "./edit";
import { save } from "./save";
import { transforms } from "./transforms";
import { variations } from "./variations";

export { type InterpretedProvidesContext } from "./context";

registerBlockType<Supports, Attributes, InterpretedUsedContext>(
	blockMetaData.name,
	{
		// icon: <Icon iconName="" />,
		deprecated,
		edit: Edit,
		save: save({ hasInnerBlocks: true }),
		transforms,
	},
);

/**
 * Register block variations
 *
 * We register block registrations using the JS function so we can support JSX for icons and functions for isActive.
 */
variations.forEach((variation) => {
	registerBlockVariation(blockMetaData.name, variation);
});
