/* eslint-disable @typescript-eslint/no-explicit-any -- We need to add any in some situations where unknown is too aggressive. */
import type { BlockSupports } from "./block-supports";
import type { DefaultAttributes } from "./default-attributes";
import type { Element } from "@wordpress/element";
import type { AllHTMLAttributes } from "react";
import {
	createBlock,
	registerBlockType as wordpressRegisterBlockType,
} from "@wordpress/blocks";
export type { BlockSupports, DefaultAttributes };

export type BlockCategory =
	| "text"
	| "media"
	| "design"
	| "widgets"
	| "theme"
	| "embed"
	// Allow other strings, but keep autocomplete of base values.
	| (string & NonNullable<unknown>);
export type AttributeTypes =
	| "null"
	| "boolean"
	| "object"
	| "array"
	| "string"
	| "integer"
	| "number";

type AllAttributes = AllHTMLAttributes<HTMLElement>;
type BooleanAttributeTypes = {
	[Property in keyof AllAttributes]-?: Required<AllAttributes>[Property] extends boolean
		? Property
		: never;
}[keyof AllAttributes];

type AttributeSourceBooleanAttribute = {
	type: "boolean" | ["boolean"];
	enum?: readonly boolean[];
	source: "attribute";
	selector: string;
	attribute: BooleanAttributeTypes;
	default?: boolean;
};

type AttributeSourceStringAttribute = {
	type: "string" | ["string"];
	enum?: readonly string[];
	source: "attribute";
	selector: string;
	attribute: string;
	default?: string;
};

type TextSourceAttribute = {
	type: "string" | ["string"];
	enum?: readonly string[];
	source: "text";
	selector: string;
	default?: string;
};

type HTMLSourceAttribute = {
	type: "string" | ["string"];
	enum?: readonly string[];
	source: "html";
	selector: string;
	default?: string;
};

type QuerySourceAttribute = {
	type: "array" | ["array"];
	source: "query";
	selector: string;
	query: Record<string, AttributesObject>;
	default?: Record<string, unknown>[];
	enum?: Record<string, unknown>[];
};

type MetaSourceAttribute = {
	type: "string" | ["string"];
	enum?: readonly string[];
	/**
	 * @deprecated
	 */
	source: "meta";
	meta: string;
	default?: string;
};

type NoSourceAttributeArrayType = {
	type: "array" | ["array"];
	source?: never;
	enum?: unknown[];
	default?: unknown[];
};

type NoSourceAttributeAnyType = {
	type: Exclude<AttributeTypes, "array"> | Exclude<AttributeTypes, "array">[];
	enum?: readonly boolean[] | readonly number[] | readonly string[];
	source?: never;
	default?: any;
};

export type AttributesObject =
	| AttributeSourceBooleanAttribute
	| AttributeSourceStringAttribute
	| TextSourceAttribute
	| HTMLSourceAttribute
	| QuerySourceAttribute
	| MetaSourceAttribute
	| NoSourceAttributeArrayType
	| NoSourceAttributeAnyType;

type InheritType<Type extends { type: string | string[] }> = Type extends {
	type: string[];
}
	? any[]
	: Type extends {
				type: "string";
		  }
		? string
		: Type extends { type: "boolean" }
			? boolean
			: Type extends { type: "object" }
				? Record<string, any>
				: Type extends { type: "null" }
					? null
					: Type extends { type: "array" }
						? any[]
						: Type extends { type: "integer" }
							? number
							: Type extends { type: "number" }
								? number
								: never;

export type InterpretAttributesWithoutDefaults<
	Attributes extends BlockAttributes,
> = {
	[Property in keyof Attributes]: Attributes[Property] extends {
		enum: NonNullable<Attributes[Property]["enum"]>;
	}
		? NonNullable<Attributes[Property]["enum"]>[number]
		: Attributes[Property] extends {
					type: "array";
					query: Record<string, AttributesObject>;
			  }
			? InterpretAttributesWithoutDefaults<
					NonNullable<Attributes[Property]["query"]>
				>[]
			: Attributes[Property] extends { type: string }
				? InheritType<Attributes[Property]>
				: never;
};
export type InterpretAttributes<
	Supports extends BlockSupports,
	Attributes extends BlockAttributes,
> = InterpretAttributesWithoutDefaults<Attributes> &
	DefaultAttributes<Supports>;

export type BlockAttributes = Readonly<Record<string, AttributesObject>>;

export type BlockProvidesContext<
	InterpretedAttributes extends Record<string, unknown>,
> = Record<string, keyof InterpretedAttributes>;

export type InterpretProvidesContext<
	UsedContextInterpretedAttributes extends Record<string, unknown>,
	Context extends
		BlockProvidesContext<UsedContextInterpretedAttributes> = BlockProvidesContext<UsedContextInterpretedAttributes>,
> = {
	[Property in keyof Context]: UsedContextInterpretedAttributes[Context[Property]];
};

export type BlockUsesContext<InterpretedContext extends Record<string, any>> =
	(keyof InterpretedContext)[];

export type InterpretUsedContext<
	UsesContext extends string[],
	InterpretedContext extends Record<UsesContext[number], any>,
> = {
	[Property in UsesContext[number]]: InterpretedContext[Property];
};

type BlockInstance = ReturnType<typeof createBlock>;
export type InnerBlocks = {
	name: BlockInstance["name"];
	attributes: BlockInstance["attributes"];
	innerBlocks?: InnerBlocks[];
};
export type BlockExample<
	InterpretedAttributes extends Record<string, unknown>,
> = {
	viewportWidth?: number;
	attributes?: InterpretedAttributes;
	innerBlocks?: InnerBlocks[];
};

/**
 * The WPDefinedPath type is a subtype of string, where the value represents a path to a JavaScript,
 * CSS or PHP file relative to where block.json file is located. The path provided must be prefixed
 * with file:. This approach is based on how npm handles local paths for packages.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#wpdefinedpath}
 */
export type WPDefinedPath = `file:${string}`;
/**
 * This asset can be a local file path relative to the block.json file (must be prefixed with `file:`) or
 * it can be a style or script handle from a registered asset.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#wpdefinedasset}
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- WPDefinedPath is defined by WordPress and may be extended in the future.
export type WPDefinedAsset = WPDefinedPath | string;

type RecursivePartial<T> =
	T extends Record<string, unknown>
		? {
				[P in keyof T]?: RecursivePartial<T[P]>;
			}
		: T extends Record<string, unknown>[]
			? RecursivePartial<T[keyof T]>[]
			: T;

export type BlockVariations<
	InterpretedAttributes extends Record<string, unknown>,
> = {
	name: string;
	title: string;
	description?: string;
	category?: BlockCategory;
	icon?: string | JSX.Element;
	isDefault?: boolean;
	attributes?: RecursivePartial<InterpretedAttributes>;
	innerBlocks?: InnerBlocks[];
	example?: BlockExample<InterpretedAttributes>;
	scope?: ("inserter" | "block" | "transform")[];
	keywords?: string[];
	isActive?:
		| string[]
		| ((
				blockAttributes: InterpretedAttributes,
				// TODO: This should be the exact type of the variation "attributes" props, find a way to pass that value here.
				variationAttributes: RecursivePartial<InterpretedAttributes>,
		  ) => boolean);
}[];

export type BlockMetaData<
	Supports extends BlockSupports,
	Attributes extends BlockAttributes,
	InterpretedAttributes extends InterpretAttributes<
		Supports,
		Attributes
	> = InterpretAttributes<Supports, Attributes>,
> = {
	/**
	 * The version of the Block API used by the block. The most recent version is 2 and it was introduced in WordPress 5.6.
	 *
	 * See the API versions documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-api-versions/ for more details.
	 */
	apiVersion?: 1 | 2 | 3;

	/**
	 * The name for a block is a unique string that identifies a block.
	 * Names have to be structured as `namespace/block-name`, where namespace is the name of your plugin or theme.
	 * Regex: ^[a-z][a-z0-9-]\*\/[a-z][a-z0-9-]\*$
	 */
	name: string;

	/**
	 * This is the display title for your block, which can be translated with our translation functions. The block inserter will show this name.
	 */
	title: string;

	/**
	 * Blocks are grouped into categories to help users browse and discover them.
	 * Core provided categories are: text, media, design, widgets, theme, embed
	 *
	 * Plugins and Themes can also register custom block categories.
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/#managing-block-categories
	 */
	category?: BlockCategory;

	/**
	 * Setting parent lets a block require that it is only available when nested within the specified blocks.
	 * For example, you might want to allow an ‘Add to Cart’ block to only be available within a ‘Product’ block.
	 */
	parent?: string[];

	/**
	 * The `ancestor` property makes a block available inside the specified block types at any position of the ancestor block subtree.
	 * That allows, for example, to place a ‘Comment Content’ block inside a ‘Column’ block, as long as ‘Column’ is somewhere within a ‘Comment Template’ block.
	 */
	ancestor?: string[];

	/**
	 * The allowedBlocks specifies which block types can be the direct children of the block.
	 * For example, a ‘List’ block can allow only ‘List Item’ blocks as children.
	 */
	allowedBlocks?: string[];

	/**
	 * An icon property should be specified to make it easier to identify a block.
	 * These can be any of WordPress’ Dashicons (slug serving also as a fallback in non-js contexts).
	 *
	 * @deprecated define in client register to allow custom SVGs.
	 */
	icon?: string;

	/**
	 * This is a short description for your block, which can be translated with our translation functions. This will be shown in the block inspector.
	 */
	description?: string;

	/**
	 * Sometimes a block could have aliases that help users discover it while searching.
	 * For example, an image block could also want to be discovered by photo. You can do so by providing an array of unlimited terms (which are translated).
	 */
	keywords?: string[];

	/**
	 * The current version number of the block, such as 1.0 or 1.0.3. It’s similar to how plugins are versioned.
	 * This field might be used with block assets to control cache invalidation, and when the block author omits it,
	 * then the installed version of WordPress is used instead.
	 */
	version?: string;
	/**
	 * The gettext text domain of the plugin/block. More information can be found in the Text Domain section of the How to Internationalize your Plugin page.
	 *
	 * @see https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/
	 */
	textdomain?: string;

	/**
	 * Attributes provide the structured data needs of a block. They can exist in different forms when they are serialized, but they are declared together under a common interface.
	 * See the attributes documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/ for more details.
	 * Property names must only contain letters Regex:[a-zA-Z]
	 */
	attributes?: Attributes;

	/**
	 * Context provided for available access by descendants of blocks of this type, in the form of an object which maps a context name to one of the block’s own attribute.
	 * See the block context documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-context/ for more details.
	 * Property names must only contain letters Regex:[a-zA-Z]
	 */
	providesContext?: BlockProvidesContext<Attributes>;

	/**
	 * Array of the names of context values to inherit from an ancestor provider.
	 * See the block context documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-context/ for more details.
	 */
	usesContext?: string[];

	/**
	 * It contains as set of options to control features used in the editor. See the supports documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ for more details.
	 */
	supports?: Supports;

	/**
	 * Block styles can be used to provide alternative styles to block. It works by adding a class name to the block’s wrapper.
	 * Using CSS, a theme developer can target the class name for the block style if it is selected.
	 *
	 * Plugins and Themes can also register custom block style for existing blocks.
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/#block-styles
	 */
	styles?: {
		name: string;
		label: string;
		isDefault?: boolean;
	}[];

	/**
	 * It provides structured example data for the block. This data is used to construct a preview for the block to be shown in the Inspector Help Panel when the user mouses over the block.
	 * See the example documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/#example-optional for more details.
	 */
	example?: BlockExample<InterpretedAttributes>;

	/**
	 * Block type editor scripts definition. They will only be enqueued in the context of the editor.
	 */
	editorScript?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend and editor scripts definition. They will be enqueued both in the editor and when viewing the content on the front of the site.
	 */
	script?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend scripts definition. They will be enqueued only when viewing the content on the front of the site.
	 */
	viewScript?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type editor styles definition. They will only be enqueued in the context of the editor.
	 */
	editorStyle?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend and editor styles definition. They will be enqueued both in the editor and when viewing the content on the front of the site.
	 */
	style?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend styles definition. They will be enqueued only when viewing the content on the front of the site.
	 */
	viewStyle?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block Variations is the API that allows a block to have similar versions of it, but all these versions share some common functionality.
	 */
	variations?: Omit<
		BlockVariations<InterpretedAttributes>,
		"icon" | "isActive"
	> & {
		// Block JSON file doesn't allow JSX or functions
		icon?: string;
		isActive?: string[];
	};

	/**
	 * Template file loaded on the server when rendering a block.
	 */
	render?: WPDefinedPath;
};
export type BlockMigrateDeprecationFunction<
	OldInterpretedAttributes extends Record<string, unknown>,
	NewInterpretedAttributes extends Record<string, unknown>,
> = (
	attributes: OldInterpretedAttributes,
	innerBlocks: InnerBlocks[],
) => NewInterpretedAttributes | [NewInterpretedAttributes, InnerBlocks[]];

export type BlockIsDeprecationEligibleFunction<
	InterpretedAttributes extends Record<string, unknown>,
> = (attributes: InterpretedAttributes, innerBlocks: InnerBlocks[]) => boolean;

export type CreateBlockSaveProps<
	InterpretedAttributes extends Record<string, unknown>,
> = {
	readonly attributes: InterpretedAttributes;
	readonly innerBlocks: readonly InnerBlocks[];
};
export type CreateBlockEditProps<
	InterpretedAttributes extends Record<string, unknown>,
	Context extends Record<string, any> = Record<string, never>,
> = {
	readonly clientId: string;
	readonly attributes: InterpretedAttributes;
	readonly context: Context;
	readonly insertBlocksAfter: BlockInstance[] | undefined;
	readonly isSelected: boolean;
	readonly mergeBlocks: BlockInstance[] | undefined;
	readonly onRemove: () => void | undefined;
	readonly onReplace: (
		clientIds: string | string[],
		blocks: BlockInstance | BlockInstance[],
		indexToSelect: number,
		initialPosition: 0 | -1 | null,
		meta: Record<string, unknown>,
	) => BlockInstance[] | undefined;
	readonly setAttributes: (attributes: Partial<InterpretedAttributes>) => void;
	readonly toggleSelection: (isSelectionEnabled: boolean) => void;
};

export type BlockTypeTransform<
	InterpretedAttributes extends Record<string, unknown>,
> = {
	type: "block";
	blocks: string[];
	transform: (
		attributes: InterpretedAttributes,
		innerBlocks: InnerBlocks[],
	) => BlockInstance | BlockInstance[];
	isMatch?: (
		attributes: InterpretedAttributes,
		block: BlockInstance,
	) => boolean;
	isMultiBlock?: boolean;
	priority?: number;
};

export type EnterTypeTransform = {
	type: "enter";
	regExp: RegExp;
	transform: (enteredValue: string) => BlockInstance | BlockInstance[];
	priority?: number;
};

export type FilesTypeTransform = {
	type: "files";
	transform: (files: File[]) => BlockInstance | BlockInstance[];
	isMatch?: (files: File[]) => boolean;
	priority?: number;
};

export type PrefixTypeTransform = {
	type: "prefix";
	prefix: string;
	transform: (content: File[]) => BlockInstance | BlockInstance[];
	priority?: number;
};

export type PhrasingContentSchema = {
	strong: Record<string, never>;
	em: Record<string, never>;
	s: Record<string, never>;
	del: Record<string, never>;
	ins: Record<string, never>;
	a: { attributes: ["href", "target", "rel", "id"] };
	code: Record<string, never>;
	abbr: { attributes: ["title"] };
	sub: Record<string, never>;
	sup: Record<string, never>;
	br: Record<string, never>;
	small: Record<string, never>;
	cite: Record<string, never>;
	q: { attributes: ["cite"] };
	dfn: { attributes: ["title"] };
	data: { attributes: ["value"] };
	time: { attributes: ["datetime"] };
	var: Record<string, never>;
	samp: Record<string, never>;
	kbd: Record<string, never>;
	i: Record<string, never>;
	b: Record<string, never>;
	u: Record<string, never>;
	mark: Record<string, never>;
	ruby: Record<string, never>;
	rt: Record<string, never>;
	rp: Record<string, never>;
	bdi: { attributes: ["dir"] };
	bdo: { attributes: ["dir"] };
	wbr: Record<string, never>;
	"#text": Record<string, never>;
	audio: {
		attributes: ["src", "preload", "autoplay", "mediagroup", "loop", "muted"];
	};
	canvas: { attributes: ["width", "height"] };
	embed: { attributes: ["src", "type", "width", "height"] };
	img: {
		attributes: ["alt", "src", "srcset", "usemap", "ismap", "width", "height"];
	};
	object: {
		attributes: ["data", "type", "name", "usemap", "form", "width", "height"];
	};
	video: {
		attributes: [
			"src",
			"poster",
			"preload",
			"autoplay",
			"mediagroup",
			"loop",
			"muted",
			"controls",
			"width",
			"height",
		];
	};
};

export type TransformRawSchema = {
	[k in keyof HTMLElementTagNameMap | "#text"]?: {
		attributes?: string[] | undefined;
		require?: (keyof HTMLElementTagNameMap)[] | undefined;
		classes?: (string | RegExp)[] | undefined;
		children?: TransformRawSchema | undefined;
	};
};

export type RawTypeTransform = {
	type: "raw";
	transform?: (node: Node) => BlockInstance | BlockInstance[];
	schema?:
		| TransformRawSchema
		| (({
				phrasingContentSchema,
				isPaste,
		  }: {
				phrasingContentSchema: PhrasingContentSchema;
				isPaste: boolean;
		  }) => TransformRawSchema);
	selector?: string;
	isMatch?: (node: Node) => boolean;
	priority?: number;
};

export type WPShortCodeAttributes = {
	named: Record<string, string | undefined>;
	numeric: string[];
};

export type WPShortCode = {
	attrs: WPShortCodeAttributes;
	tag: string;
} & ({ type: "closed"; content: string } | { type: "self-closing" | "single" });

export type WPShortCodeMatch = {
	index: number;
	content: string;
	shortcode: WPShortCode;
};

export type ShortCodeTypeTransform = {
	type: "shortcode";
	tag: string | string[];
	transform?: (
		shortcodeAttributes: WPShortCodeAttributes,
		shortcodeMatch: WPShortCodeMatch,
	) => BlockInstance | BlockInstance[];
	attributes?: Readonly<
		Record<
			string,
			BlockAttributes & {
				shortcode: (
					shortcodeAttributes: WPShortCodeAttributes,
					shortcodeMatch: WPShortCodeMatch,
				) => unknown;
			}
		>
	>;
	isMatch?: (shortcodeAttributes: WPShortCodeAttributes) => boolean;
	priority?: number;
};

export type BlockTransforms<
	InterpretedAttributes extends Record<string, unknown>,
> =
	| BlockTypeTransform<InterpretedAttributes>[]
	| EnterTypeTransform[]
	| FilesTypeTransform[]
	| PrefixTypeTransform[]
	| RawTypeTransform[]
	| ShortCodeTypeTransform[];

export type ClientOnlyRegisterOptions<
	InterpretedAttributes extends Record<string, unknown>,
	InterpretedUsedContext extends Record<string, any> = Record<string, never>,
> = {
	/**
	 * An icon property should be specified to make it easier to identify a block..
	 */
	icon?: string | JSX.Element;
	edit: (
		props: CreateBlockEditProps<InterpretedAttributes, InterpretedUsedContext>,
	) => Element;
	save: (props: CreateBlockSaveProps<InterpretedAttributes>) => Element | null;
	deprecated?: unknown[];
	/**
	 * An API that allows a block to be transformed from and to other blocks, as well as from other entities.
	 * Existing entities that work with this API include shortcodes, files, regular expressions, and raw DOM nodes.
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-transforms/
	 */
	transforms?: {
		from: BlockTransforms<InterpretedAttributes>;
		to: BlockTransforms<InterpretedAttributes>;
	};
};

export type DeprecationAndFixture<
	OldSupports extends BlockSupports,
	OldAttributes extends BlockAttributes,
	NewInterpretedAttributes extends Record<string, unknown>,
	OldInterpretedAttributes extends InterpretAttributes<
		OldSupports,
		OldAttributes
	> = InterpretAttributes<OldSupports, OldAttributes>,
> = {
	fixture: string[];
	object: Deprecation<
		OldSupports,
		OldAttributes,
		NewInterpretedAttributes,
		OldInterpretedAttributes
	>;
};
export type Deprecation<
	OldSupports extends BlockSupports,
	OldAttributes extends BlockAttributes,
	NewInterpretedAttributes extends Record<string, unknown>,
	OldInterpretedAttributes extends InterpretAttributes<
		OldSupports,
		OldAttributes
	> = InterpretAttributes<OldSupports, OldAttributes>,
> = {
	attributes: OldAttributes;
	supports: OldSupports;
	isEligible: BlockIsDeprecationEligibleFunction<OldInterpretedAttributes>;
	migrate: BlockMigrateDeprecationFunction<
		OldInterpretedAttributes,
		NewInterpretedAttributes
	>;
	save: (
		props: CreateBlockSaveProps<OldInterpretedAttributes>,
	) => Element | null;
};

export type AllDeprecations<
	NewInterpretedAttributes extends Record<string, unknown>,
> = {
	attributes: any;
	supports: any;
	isEligible: (attributes: any, innerBlocks: InnerBlocks[]) => boolean;
	migrate: (
		attributes: any,
		innerBlocks: InnerBlocks[],
	) => NewInterpretedAttributes | [NewInterpretedAttributes, InnerBlocks[]];
	save: (props: {
		readonly attributes: any;
		readonly innerBlocks: readonly InnerBlocks[];
	}) => Element | null;
}[];

export function registerBlockType<
	InterpretedAttributes extends Record<string, unknown>,
	InterpretedUsedContext extends Record<string, any> = Record<string, never>,
>(
	name: string,
	settings: ClientOnlyRegisterOptions<
		InterpretedAttributes,
		InterpretedUsedContext
	>,
) {
	/* @ts-expect-error Provided types are inaccurate and will provide an error with some valid inputs */
	return wordpressRegisterBlockType(name, settings);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
