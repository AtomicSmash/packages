import type { InterpretedAttributes } from "./attributes";
import type {
	BlockAttributes,
	BlockSupports,
	CreateBlockSaveProps,
	DeprecationAndFixture,
	AllDeprecations,
	InterpretAttributes,
} from "@atomicsmash/blocks-helpers";
import { useBlockProps, RichText } from "@wordpress/block-editor";
import { createBlock } from "@wordpress/blocks";
import { attributes as currentAttributes } from "./attributes";
import { supports as currentSupports } from "./supports";

// edit attributes to what they were in v1
const v1Attributes = {
	...currentAttributes,
	url: {
		type: "string",
		source: "attribute",
		selector: "img",
		attribute: "src",
	},
} as const satisfies BlockAttributes;
type V1Attributes = typeof v1Attributes;

// edit supports to what they were in v1
const v1Supports = { ...currentSupports } as const satisfies BlockSupports;
type V1Supports = typeof v1Supports;

type V1InterpretedAttributes = InterpretAttributes<V1Supports, V1Attributes>;

type BlockSaveProps = CreateBlockSaveProps<V1InterpretedAttributes>;

export const v1 = {
	/**
	 * This is a snapshot of a blocks code from this migration used for testing migrations.
	 */
	fixture: [
		`<!-- wp:snap-blocks/deprecated-block -->
	<div class="wp-block-snap-blocks-deprecated-block align-none blockSize-small"><h2 class="title">This is a <strong>block</strong> to be <em>migrated</em></h2><img src="https://placekitten.com/200/300" alt=""/></div>
	<!-- /wp:snap-blocks/deprecated-block -->`,
	],
	object: {
		attributes: v1Attributes,
		supports: v1Supports,
		save: ({ attributes }: BlockSaveProps) => {
			const { title, url, align, size } = attributes;
			const blockProps = useBlockProps.save({
				className: `align-${align} blockSize-${size}`,
			});
			return (
				<div {...blockProps}>
					<RichText.Content tagName="h2" value={title} className="title" />
					<img src={url} alt="" />
				</div>
			);
		},
		migrate: (oldAttributes) => {
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
		},
		isEligible: ({ url }) => {
			return url !== undefined;
		},
	},
} satisfies DeprecationAndFixture<
	V1Supports,
	V1Attributes,
	InterpretedAttributes
>;

export const deprecated = [
	v1.object,
] as const satisfies AllDeprecations<InterpretedAttributes>;
