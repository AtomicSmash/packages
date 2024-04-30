/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Element } from "@wordpress/element";
import {
	createBlock,
	registerBlockType as wordpressRegisterBlockType,
} from "@wordpress/blocks";

export type BlockCategory =
	| "text"
	| "media"
	| "design"
	| "widgets"
	| "theme"
	| "embed";
export type AttributeTypes =
	| "null"
	| "boolean"
	| "object"
	| "array"
	| "string"
	| "integer"
	| "number";
export type AttributesObject<BlockType extends "static" | "dynamic"> = {
	default?: any;
	items?: {
		type: AttributeTypes;
	};
} & (BlockType extends "static"
	? {
			source?: "attribute" | "text" | "html" | "query" | "meta";
			selector?: string;
			attribute?: string;
			multiline?: string;
			query?: Record<string, AttributesObject<BlockType>>;
			meta?: string;
		}
	: Record<string, never>) &
	(
		| {
				type: AttributeTypes | AttributeTypes[];
				enum?: readonly boolean[] | readonly number[] | readonly string[];
		  }
		| {
				type?: AttributeTypes | AttributeTypes[];
				enum: readonly boolean[] | readonly number[] | readonly string[];
		  }
	);

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

export type InterpretAttributes<Attributes extends AnyBlockAttributes> = {
	[Property in keyof Attributes]: Attributes[Property] extends {
		enum: NonNullable<Attributes[Property]["enum"]>;
	}
		? NonNullable<Attributes[Property]["enum"]>[number]
		: Attributes[Property] extends {
					type: "array";
					query: NonNullable<Attributes[Property]["query"]>;
			  }
			? InterpretAttributes<NonNullable<Attributes[Property]["query"]>>[]
			: Attributes[Property] extends { type: string }
				? InheritType<Attributes[Property]>
				: never;
};
export type DefaultAttributes<Supports extends BlockSupports> = {
	className: Supports extends { customClassName: false }
		? never
		: { type: "string" };
	lock: Supports extends { lock: false } ? never : { type: "object" };
	metadata: { type: "object" };
};
export type AnyBlockAttributes =
	| BlockAttributes<"static">
	| BlockAttributes<"dynamic">;
export type BlockAttributes<BlockType extends "static" | "dynamic"> = Readonly<
	Record<string, AttributesObject<BlockType>>
>;
export type BlockSupports = Record<string, any> & {
	anchor?: boolean;
	align?: boolean | ("wide" | "full" | "left" | "center" | "right")[];
	alignWide?: boolean;
	ariaLabel?: boolean;
	className?: boolean;
	color?: {
		background?: boolean;
		gradients?: boolean;
		link?: boolean;
		text?: boolean;
		enableContrastChecker?: boolean;
	};
	customClassName?: boolean;
	defaultStylePicker?: boolean;
	html?: boolean;
	inserter?: boolean;
	multiple?: boolean;
	reusable?: boolean;
	lock?: boolean;
	spacing?: {
		margin?:
			| boolean
			| ("top" | "right" | "left" | "bottom")[]
			| ("vertical" | "horizontal")[];
		padding?:
			| boolean
			| ("top" | "right" | "left" | "bottom")[]
			| ("vertical" | "horizontal")[];
	};
	typography?: {
		fontSize?: boolean;
		lineHeight?: boolean;
	};
};
export type BlockProvidesContext<Attributes extends AnyBlockAttributes> =
	Record<string, keyof Attributes>;
export type InterpretProvidesContext<
	UsedContextAttributes extends AnyBlockAttributes,
	Context extends
		BlockProvidesContext<UsedContextAttributes> = BlockProvidesContext<UsedContextAttributes>,
> = {
	[Property in keyof Context]: InterpretAttributes<UsedContextAttributes>[Context[Property]];
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
export type BlockExample<Attributes extends AnyBlockAttributes> = {
	viewportWidth?: number;
	attributes?: InterpretAttributes<Attributes>;
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

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

export type BlockVariations<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
> = {
	name: string;
	title: string;
	description?: string;
	category?: BlockCategory;
	icon?: string | JSX.Element;
	isDefault?: boolean;
	attributes?: RecursivePartial<
		InterpretAttributes<Attributes> &
			InterpretAttributes<DefaultAttributes<Supports>>
	>;
	innerBlocks?: InnerBlocks[];
	example?: BlockExample<Attributes>;
	scope?: ("inserter" | "block" | "transform")[];
	keywords?: string[];
	isActive?:
		| string[]
		| ((
				blockAttributes: InterpretAttributes<Attributes> &
					InterpretAttributes<DefaultAttributes<Supports>>,
				// TODO: This should be the exact type of the variation "attributes" props, find a way to pass that value here.
				variationAttributes: RecursivePartial<
					InterpretAttributes<Attributes> &
						InterpretAttributes<DefaultAttributes<Supports>>
				>,
		  ) => boolean);
}[];

export type BlockMetaData<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
> = {
	/**
	 * The version of the Block API used by the block. The most recent version is 2 and it was introduced in WordPress 5.6.
	 *
	 * See the API versions documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-api-versions/ for more details.
	 */
	apiVersion?: 1 | 2;

	/**
	 * The name for a block is a unique string that identifies a block.
	 * Names have to be structured as `namespace/block-name`, where namespace is the name of your plugin or theme.
	 * Regex: ^[a-z][a-z0-9-]\*\/[a-z][a-z0-9-]\*$
	 */
	name: string;

	/**
	 * The name of the experiment this block is a part of, or boolean true if there is no specific experiment name.
	 */
	__experimental?: boolean | string;

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
	 * An icon property should be specified to make it easier to identify a block.
	 * These can be any of WordPress’ Dashicons (slug serving also as a fallback in non-js contexts).
	 */
	icon?: string | JSX.Element;

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
	example?: BlockExample<Attributes>;

	/**
	 * Block type editor script definition. It will only be enqueued in the context of the editor.
	 */
	editorScript?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend and editor script definition. It will be enqueued both in the editor and when viewing the content on the front of the site.
	 */
	script?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend script definition. It will be enqueued only when viewing the content on the front of the site.
	 */
	viewScript?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type editor style definition. It will only be enqueued in the context of the editor.
	 */
	editorStyle?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend style definition. It will be enqueued both in the editor and when viewing the content on the front of the site.
	 */
	style?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block Variations is the API that allows a block to have similar versions of it, but all these versions share some common functionality.
	 */
	variations?: BlockVariations<Supports, Attributes>;

	/**
	 * Template file loaded on the server when rendering a block.
	 */
	render?: WPDefinedPath;
};
export type BlockMigrateDeprecationFunction<
	OldSupports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
	NewSupports extends BlockSupports,
	NewAttributes extends AnyBlockAttributes,
> = (
	attributes: InterpretAttributes<Attributes> &
		InterpretAttributes<DefaultAttributes<OldSupports>>,
	innerBlocks: InnerBlocks[],
) =>
	| (InterpretAttributes<NewAttributes> &
			InterpretAttributes<DefaultAttributes<NewSupports>>)
	| [
			InterpretAttributes<NewAttributes> &
				InterpretAttributes<DefaultAttributes<NewSupports>>,
			InnerBlocks[],
	  ];

export type BlockIsDeprecationEligibleFunction<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
> = (
	attributes: InterpretAttributes<Attributes> &
		InterpretAttributes<DefaultAttributes<Supports>>,
	innerBlocks: InnerBlocks[],
) => boolean;

export type BlockSaveProps<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
> = {
	readonly attributes: InterpretAttributes<Attributes> &
		InterpretAttributes<DefaultAttributes<Supports>>;
	readonly innerBlocks: Readonly<InnerBlocks[]>;
};
export type BlockEditProps<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
	Context extends Record<string, any> = Record<string, never>,
> = {
	readonly clientId: string;
	readonly attributes: InterpretAttributes<Attributes> &
		InterpretAttributes<DefaultAttributes<Supports>>;
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
	readonly setAttributes: (
		attributes: Partial<InterpretAttributes<Attributes>>,
	) => void;
	readonly toggleSelection: (isSelectionEnabled: boolean) => void;
};

export type BlockTypeTransform<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
> = {
	type: "block";
	blocks: string[];
	transform: (
		attributes: InterpretAttributes<Attributes> &
			InterpretAttributes<DefaultAttributes<Supports>>,
		innerBlocks: InnerBlocks[],
	) => BlockInstance | BlockInstance[];
	isMatch?: (
		attributes: InterpretAttributes<Attributes> &
			InterpretAttributes<DefaultAttributes<Supports>>,
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
			(AttributesObject<"static"> | AttributesObject<"dynamic">) & {
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
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
> =
	| BlockTypeTransform<Supports, Attributes>[]
	| EnterTypeTransform[]
	| FilesTypeTransform[]
	| PrefixTypeTransform[]
	| RawTypeTransform[]
	| ShortCodeTypeTransform[];

export type BlockSettings<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
	InterpretedUsedContext extends Record<string, any> = Record<string, never>,
> = (Attributes extends BlockAttributes<"static">
	? CurrentStaticBlockDefinition<Supports, Attributes, InterpretedUsedContext>
	: Attributes extends BlockAttributes<"dynamic">
		? CurrentDynamicBlockDefinition<
				Supports,
				Attributes,
				InterpretedUsedContext
			>
		: never) & {
	deprecated?: unknown[];
};

export type LoosenTypeOfObject<Type extends Record<string, any>> = {
	[Property in keyof Type]: Type[Property] extends string
		? string
		: Type[Property] extends boolean
			? boolean
			: Type[Property] extends number
				? number
				: Type[Property];
};

type CurrentBlockDefinitionBase<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes,
	InterpretedUsedContext extends Record<string, any> = Record<string, never>,
> = {
	/**
	 * Attributes provide the structured data needs of a block. They can exist in different forms when they are serialized, but they are declared together under a common interface.
	 * Property names must only contain letters Regex:[a-zA-Z]
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/
	 */
	attributes?: Attributes;
	/**
	 * It contains as set of options to control features used in the editor.
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/
	 */
	supports?: Supports;
	edit: (
		props: BlockEditProps<Supports, Attributes, InterpretedUsedContext>,
	) => Element;
	/**
	 * Context provided for available access by descendants of blocks of this type, in the form of an object which maps a context name to one of the block’s own attribute.
	 * Property names must only contain letters Regex:[a-zA-Z]
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-context/
	 */
	providesContext?: BlockProvidesContext<Attributes>;
	/**
	 * Array of the names of context values to inherit from an ancestor provider.
	 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-context/
	 */
	usesContext?: readonly (keyof InterpretedUsedContext)[];
	/**
	 * An API that allows a block to be transformed from and to other blocks, as well as from other entities.
	 * Existing entities that work with this API include shortcodes, files, regular expressions, and raw DOM nodes.
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-transforms/
	 */
	transforms?: {
		from: BlockTransforms<Supports, Attributes>;
		to: BlockTransforms<Supports, Attributes>;
	};
	/**
	 * Block Variations is the API that allows a block to have similar versions of it, but all these versions share some common functionality.
	 */
	variations?: BlockVariations<Supports, Attributes>;
};

export type CurrentStaticBlockDefinition<
	Supports extends BlockSupports,
	Attributes extends BlockAttributes<"static">,
	InterpretedUsedContext extends Record<string, any> = Record<string, never>,
> = CurrentBlockDefinitionBase<Supports, Attributes, InterpretedUsedContext> & {
	save: (props: BlockSaveProps<Supports, Attributes>) => Element;
};
export type CurrentDynamicBlockDefinition<
	Supports extends BlockSupports,
	Attributes extends BlockAttributes<"dynamic">,
	InterpretedUsedContext extends Record<string, any> = Record<string, never>,
> = CurrentBlockDefinitionBase<Supports, Attributes, InterpretedUsedContext> & {
	save?: (props: BlockSaveProps<Supports, Attributes>) => Element | null;
};
type DeprecatedBlockBase<
	OldSupports extends BlockSupports,
	OldAttributes extends AnyBlockAttributes,
	NewSupports extends BlockSupports,
	NewAttributes extends AnyBlockAttributes,
> = {
	migrate?: BlockMigrateDeprecationFunction<
		OldSupports,
		OldAttributes,
		NewSupports,
		NewAttributes
	>;
	isEligible?: BlockIsDeprecationEligibleFunction<OldSupports, OldAttributes>;
};
export type DeprecatedStaticBlock<
	OldSupports extends BlockSupports,
	OldAttributes extends BlockAttributes<"static">,
	NewSupports extends BlockSupports,
	NewAttributes extends AnyBlockAttributes,
> = Omit<CurrentStaticBlockDefinition<OldSupports, OldAttributes>, "edit"> &
	DeprecatedBlockBase<OldSupports, OldAttributes, NewSupports, NewAttributes>;
export type DeprecatedDynamicBlock<
	OldSupports extends BlockSupports,
	OldAttributes extends BlockAttributes<"dynamic">,
	NewSupports extends BlockSupports,
	NewAttributes extends AnyBlockAttributes,
> = Omit<CurrentStaticBlockDefinition<OldSupports, OldAttributes>, "edit"> &
	DeprecatedBlockBase<OldSupports, OldAttributes, NewSupports, NewAttributes>;
export type DeprecatedBlock<
	OldSupports extends BlockSupports,
	OldAttributes extends AnyBlockAttributes,
	NewSupports extends BlockSupports,
	NewAttributes extends AnyBlockAttributes,
> =
	OldAttributes extends BlockAttributes<"static">
		? DeprecatedStaticBlock<
				OldSupports,
				OldAttributes,
				NewSupports,
				NewAttributes
			>
		: OldAttributes extends BlockAttributes<"dynamic">
			? DeprecatedDynamicBlock<
					OldSupports,
					OldAttributes,
					NewSupports,
					NewAttributes
				>
			: never;

export function registerBlockType<
	Supports extends BlockSupports,
	Attributes extends AnyBlockAttributes = Record<string, never>,
	UsedContext extends Record<string, any> = Record<string, never>,
>(
	name: string,
	settings: Partial<BlockMetaData<Supports, Attributes>> &
		BlockSettings<Supports, Attributes, UsedContext>,
) {
	/* @ts-expect-error Provided types are inaccurate and will provide an error with some valid inputs */
	return wordpressRegisterBlockType<Attributes>(name, settings);
}
