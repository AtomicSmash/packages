import type { InterpretedAttributes as NewInterpretedAttributes } from "../v2/index";
import type {
	BlockAttributes,
	BlockSupports,
	InterpretAttributes,
	DeprecatedBlock,
	BlockMigrateDeprecationFunction,
	BlockIsDeprecationEligibleFunction,
} from "@atomicsmash/blocks-helpers";
import { createBlock } from "@wordpress/blocks";
import { Save } from "./save";

export const attributes = {
	url: {
		type: "string",
		source: "attribute",
		selector: "img",
		attribute: "src",
	},
	title: {
		type: "string",
	},
	size: {
		enum: ["small", "large"],
		default: "small",
	},
	align: {
		type: "string",
		default: "none",
	},
} as const satisfies BlockAttributes;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Attributes>;

export const supports = {} as const satisfies BlockSupports;
export type Supports = typeof supports;

/**
 * Deprecation migration function.
 *
 * This function dictates to WordPress how to update the block to the latest version.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/ The WordPress documentation}
 */
const migrate: BlockMigrateDeprecationFunction<
	InterpretedAttributes,
	NewInterpretedAttributes
> = (oldAttributes) => {
	const { url, ...migratedAttributes } = oldAttributes;
	return [
		migratedAttributes,
		[
			createBlock("core/image", {
				sizeSlug: "large",
				url: url,
			}),
		],
	];
};

/**
 * Deprecation isEligible function.
 *
 * This function is particularly useful in cases where a block is technically valid even once deprecated,
 * but still requires updates to its attributes or inner blocks.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/ The WordPress documentation}
 */
const isEligible: BlockIsDeprecationEligibleFunction<InterpretedAttributes> = ({
	url,
}) => {
	return url !== undefined;
};

export const v1 = {
	attributes,
	supports,
	migrate,
	isEligible,
	save: Save,
} satisfies DeprecatedBlock<InterpretedAttributes>;
