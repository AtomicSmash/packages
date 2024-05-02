import {
	BlockAttributes,
	BlockIsDeprecationEligibleFunction,
	BlockMigrateDeprecationFunction,
	BlockSupports,
} from "@atomicsmash/blocks-helpers";
import { type Attributes, attributes as currentAttributes } from "./attributes";
import { type Supports, supports as currentSupports } from "./supports";

// edit attributes to what they were in v1
const v1Attributes = { ...currentAttributes };
type V1Attributes = typeof v1Attributes;

// edit supports to what they were in v1
const v1Supports = { ...currentSupports };
type V1Supports = typeof v1Supports;

export const v1 = {
	/**
	 * This is a snapshot of a blocks code from this migration used for testing migrations.
	 */
	fixture: "",
	object: {
		attributes: v1Attributes,
		supports: v1Supports,
		save: () => null,
		migrate: (oldAttributes, innerBlocks) => {
			// Convert the old block into the new block here.
			return [oldAttributes, innerBlocks];
		},
		isEligible: () => true,
	},
} satisfies {
	fixture: string;
	object: {
		attributes: BlockAttributes<"dynamic">;
		supports: BlockSupports;
		isEligible: BlockIsDeprecationEligibleFunction<V1Supports, V1Attributes>;
		migrate: BlockMigrateDeprecationFunction<
			V1Supports,
			V1Attributes,
			Supports,
			Attributes
		>;
		save: () => null | JSX.Element;
	};
};

export const deprecated = [v1];
