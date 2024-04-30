import {
	BlockAttributes,
	BlockSupports,
	InterpretAttributes,
	CurrentStaticBlockDefinition,
	BlockEditProps as CreateBlockEditProps,
	BlockSaveProps as CreateBlockSaveProps,
} from "@atomicsmash/blocks-helpers";
import { Edit } from "./edit";
import { Save } from "./save";

/**
 * Block attributes.
 *
 * Block attributes provide information about the data stored by a block.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/ The WordPress documentation}
 */
export const attributes = {
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
} as const satisfies BlockAttributes<"static">;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Attributes>;

/**
 * Block supports.
 *
 * Block Supports is the API that allows a block to declare support for certain features.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ The WordPress documentation}
 */
export const supports = {} as const satisfies BlockSupports;
export type Supports = typeof supports;

export type BlockEditProps = CreateBlockEditProps<Supports, Attributes>;
export type BlockSaveProps = CreateBlockSaveProps<Supports, Attributes>;

export const v2 = {
	attributes,
	supports,
	edit: Edit,
	save: Save,
} satisfies CurrentStaticBlockDefinition<Supports, Attributes>;
