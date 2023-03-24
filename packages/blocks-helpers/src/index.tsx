/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WPElement } from "@wordpress/element";
import type { SVGProps } from "react";
import {
	createBlock,
	registerBlockType as wordpressRegisterBlockType,
	registerBlockCollection,
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
export type AttributesObject =
	| {
			source?: "attribute" | "text" | "html" | "query" | "meta";
			selector?: string;
			attribute?: string;
			multiline?: string;
			query?: Record<string, any>;
			meta?: string;
			default?: any;
	  } & (
			| {
					type: AttributeTypes | AttributeTypes[];
					enum?:
						| ReadonlyArray<boolean>
						| ReadonlyArray<number>
						| ReadonlyArray<string>;
			  }
			| {
					type?: AttributeTypes | AttributeTypes[];
					enum:
						| ReadonlyArray<boolean>
						| ReadonlyArray<number>
						| ReadonlyArray<string>;
			  }
	  );
type ReadonlyRecursive<T> = {
	[k in keyof T]: T[k] extends Record<string, any>
		? ReadonlyRecursive<T[k]>
		: T[k];
};
export type InterpretAttributes<
	Attributes extends Record<string, ReadonlyRecursive<AttributesObject>>
> = {
	[Property in keyof Attributes]: Attributes[Property] extends {
		type: "string";
	}
		? string
		: Attributes[Property] extends { type: "boolean" }
		? boolean
		: Attributes[Property] extends { type: "object" }
		? Record<string, any>
		: Attributes[Property] extends { type: "null" }
		? null
		: Attributes[Property] extends { type: "array" }
		? any[]
		: Attributes[Property] extends { type: "integer" }
		? number
		: Attributes[Property] extends { type: "number" }
		? number
		: Attributes[Property]["enum"] extends undefined
		? undefined
		: NonNullable<Attributes[Property]["enum"]>[number];
};
export type BlockAttributes = Readonly<Record<string, AttributesObject>>;
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
type BlockExample = {
	viewportWidth?: number;
	attributes?: BlockAttributes;
	innerBlocks?: BlockInstance[];
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
export type WPDefinedAsset = WPDefinedPath | string;

export type BlockMetaData<Attributes extends BlockAttributes> = {
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
	providesContext?: Record<string, string>;

	/**
	 * Array of the names of context values to inherit from an ancestor provider.
	 * See the block context documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-context/ for more details.
	 */
	usesContext?: string[];

	/**
	 * It contains as set of options to control features used in the editor. See the supports documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ for more details.
	 */
	supports?: BlockSupports;

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
	example?: BlockExample;

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
	variations?: {
		name: string;
		title: string;
		description?: string;
		category?: BlockCategory;
		icon?: string;
		isDefault?: boolean;
		attributes?: Attributes;
		innerBlocks?: BlockInstance[];
		example?: BlockExample;
		scope?: ("inserter" | "block" | "transform")[];
		keywords?: string[];
		isActive?: string[];
	}[];

	/**
	 * Template file loaded on the server when rendering a block.
	 */
	render?: WPDefinedPath;
};
export type BlockMigrateDeprecationFunction<
	InterpretedAttributes extends Record<string, any>,
	NewInterpretedAttributes extends Record<string, any>
> = (
	attributes: InterpretedAttributes,
	innerBlocks: BlockInstance[]
) => NewInterpretedAttributes | [NewInterpretedAttributes, BlockInstance[]];

export type BlockIsDeprecationEligibleFunction<
	InterpretedAttributes extends Record<string, any>
> = (
	attributes: InterpretedAttributes,
	innerBlocks: BlockInstance[]
) => boolean;

export interface BlockSaveProps<T extends Record<string, any>> {
	readonly attributes: Readonly<T>;
	readonly innerBlocks: Readonly<BlockInstance[]>;
}
export interface BlockEditProps<
	Attributes extends Record<string, any>,
	Context extends Record<string, any> = Record<string, never>
> {
	readonly clientId: string;
	readonly attributes: Readonly<Attributes>;
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
		meta: Record<string, unknown>
	) => BlockInstance[] | undefined;
	readonly setAttributes: (attributes: Partial<Attributes>) => void;
	readonly toggleSelection: (isSelectionEnabled: boolean) => void;
}

export type DeprecatedBlock<InterpretedAttributes extends Record<string, any>> =
	{
		/**
		 * Attributes provide the structured data needs of a block. They can exist in different forms when they are serialized, but they are declared together under a common interface.
		 * See the attributes documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/ for more details.
		 * Property names must only contain letters Regex:[a-zA-Z]
		 */
		attributes?: BlockAttributes;

		/**
		 * It contains as set of options to control features used in the editor. See the supports documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/ for more details.
		 */
		supports?: BlockSupports;
		migrate?: BlockMigrateDeprecationFunction<
			InterpretedAttributes,
			Record<string, any>
		>;
		isEligible?: BlockIsDeprecationEligibleFunction<InterpretedAttributes>;
		save: ({ attributes }: BlockSaveProps<InterpretedAttributes>) => WPElement;
	};

type BlockInstance = ReturnType<typeof createBlock>;

export type BlockTypeTransform = {
	type: "block";
	blocks: string[];
	transform: (
		attributes: BlockAttributes,
		innerBlocks: BlockInstance[]
	) => BlockInstance | BlockInstance[];
	isMatch?: (
		attributes: BlockAttributes,
		block: ReturnType<typeof createBlock>
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
			"height"
		];
	};
};

export type TransformRawSchema = {
	[k in keyof HTMLElementTagNameMap | "#text"]?: {
		attributes?: string[] | undefined;
		require?: Array<keyof HTMLElementTagNameMap> | undefined;
		classes?: Array<string | RegExp> | undefined;
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

export interface WPShortCodeAttributes {
	named: Record<string, string | undefined>;
	numeric: string[];
}

export type WPShortCode = {
	attrs: WPShortCodeAttributes;
	tag: string;
} & ({ type: "closed"; content: string } | { type: "self-closing" | "single" });

export interface WPShortCodeMatch {
	index: number;
	content: string;
	shortcode: WPShortCode;
}

export type ShortCodeTypeTransform = {
	type: "shortcode";
	tag: string | string[];
	transform?: (
		shortcodeAttributes: WPShortCodeAttributes,
		shortcodeMatch: WPShortCodeMatch
	) => BlockInstance | BlockInstance[];
	attributes?: BlockAttributes;
	isMatch?: (shortcodeAttributes: WPShortCodeAttributes) => boolean;
	priority?: number;
};

export type BlockTransforms =
	| BlockTypeTransform[]
	| EnterTypeTransform[]
	| FilesTypeTransform[]
	| PrefixTypeTransform[]
	| RawTypeTransform[]
	| ShortCodeTypeTransform[];

export type BlockSettings<
	InterpretedAttributes extends Record<string, any>,
	AllPossibleInterpretedAttributes extends Record<
		string,
		any
	> = InterpretedAttributes,
	Context extends Record<string, any> = Record<string, never>
> = {
	edit: ({
		attributes,
		setAttributes,
		isSelected,
	}: BlockEditProps<InterpretedAttributes, Context>) => WPElement;
	save: ({ attributes }: BlockSaveProps<InterpretedAttributes>) => WPElement;
	transforms?: {
		from: BlockTransforms;
		to: BlockTransforms;
	};
	deprecated?: DeprecatedBlock<AllPossibleInterpretedAttributes>[];
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

export function registerBlockType<
	Attributes extends BlockAttributes = Record<string, never>,
	InterpretedAttributes extends Record<
		string,
		any
	> = InterpretAttributes<Attributes>,
	AllPossibleInterpretedAttributes extends Record<
		string,
		any
	> = InterpretedAttributes,
	Context extends Record<string, any> = Record<string, never>
>(
	name: string,
	settings: Partial<BlockMetaData<Attributes>> &
		BlockSettings<
			InterpretedAttributes,
			AllPossibleInterpretedAttributes,
			Context
		>
) {
	/* @ts-expect-error Provided types are inaccurate and will provide an error with some valid inputs */
	return wordpressRegisterBlockType<Attributes>(name, settings);
}

export function ASCircleLogo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			xmlSpace="preserve"
			{...props}
		>
			<circle cx={2.9} cy={6} r={0.6} />
			<circle cx={16.8} cy={14.6} r={0.6} />
			<path d="m4.9 14.2-2.1.1 1.1-1.8c-.1-.2-.2-.4-.2-.7l-2.6 1.4c.1.2.1.3.2.5l1.9-1L2 14.8h2.4L2.6 16c.1.1.2.3.4.4l2.5-1.6-.6-.6zm11-10.6-.6 2.1 2.2-.2-1.7 1.2c.1.3.2.4.3.6l2.4-1.8c-.1-.2-.2-.4-.3-.5l-2.2.2.6-2.1c-.1-.1-.3-.3-.5-.4l-2.1 2c.1.1.3.2.4.3l1.5-1.4zm.7 5.1 2.8-.7c0-.2-.1-.4-.1-.5l-2.8.7c0 .2 0 .4.1.5zM4 2.7l.7 3.5c.1-.3.3-.4.4-.6L5 4.8c.4-.4.9-.8 1.4-1.1l.6.4.6-.3-3.1-1.5c-.2.1-.3.2-.5.4zm1.8.8c-.3.3-.6.5-1 .8l-.2-1.4 1.2.6zm2.8-2.4c.5-.1.9-.2 1.3-.2V.4C8.8.4 7.7.7 6.7 1l.1.4c.4-.1.8-.3 1.3-.3l.5 2.4c.2 0 .4-.1.6-.1l-.6-2.3zM14.3 15l.7 1c-.5.4-1 .7-1.5 1l-.6-1c-.2.1-.3.2-.5.2l1.5 2.5c.2-.1.3-.2.5-.3l-.7-1.1c.5-.3 1.1-.6 1.6-1l.7 1.1c.2-.1.3-.2.4-.4l-1.7-2.4c-.1.2-.2.3-.4.4zm4-5.2c-.9-.2-1.6.3-1.8 1.4-.2.9.1 1.6.8 1.8.1-.2.1-.4.2-.5-.4-.1-.7-.5-.6-1.2.1-.8.6-1 1.2-.9.6.1 1 .5.8 1.3-.1.6-.4.9-.8.9-.1.2-.1.4-.2.6.7.1 1.3-.4 1.5-1.4.3-1.2-.2-1.9-1.1-2zM11 17.9c-.4-.1-1.1-.1-1.4-.2-.3-.1-.4-.1-.4-.3 0-.2.3-.4.8-.4.6 0 .9.2 1 .6.2 0 .4-.1.6-.1-.1-.6-.6-.9-1.5-.9s-1.4.3-1.4.9c0 .4.2.6.7.7.4.1 1 .1 1.4.2.3.1.4.1.4.3 0 .3-.3.4-1 .4-.6 0-1-.2-1.1-.5-.2 0-.4 0-.6-.1 0 .8.7 1.1 1.7 1.1.9 0 1.6-.3 1.6-.9-.2-.5-.4-.7-.8-.8zm-8.9-7.5c.1-.4.2-1.1.3-1.4.1-.3.2-.4.4-.4s.3.3.2.8c0 .6-.2 1-.6 1v.6c.6 0 1-.5 1-1.5.1-.9-.1-1.4-.7-1.5-.4 0-.6.2-.7.6-.2.4-.2 1.1-.3 1.4-.1.3-.2.4-.4.4-.3 0-.4-.4-.3-1 0-.6.2-1.1.6-1.1 0-.2.1-.4.1-.6-.8 0-1.1.6-1.2 1.6-.1 1 .2 1.7.8 1.7.5.1.7-.2.8-.6zm12-7.6c.3-.8 0-1.6-1.1-1.9-1.1-.3-1.8 0-2.1.9-.3.9.1 1.6 1.2 1.9 1.1.4 1.8 0 2-.9zm-1.9.5c-.8-.3-.9-.8-.8-1.3.2-.6.6-.9 1.4-.6.8.3.9.8.8 1.3-.2.5-.6.8-1.4.6zM6.7 15.7 4 17.4c.1.1.3.2.4.3l.7-.4c.4.3 1 .6 1.5.8v.8c.2.1.4.1.6.2V16c-.1-.1-.1-.1-.3-.1-.1-.2-.1-.2-.2-.2zM5.5 17l1.1-.7v1.3c-.3-.2-.8-.4-1.1-.6z" />
		</svg>
	);
}

export function registerSnapBlocksCollection() {
	registerBlockCollection("snap-blocks", {
		title: "Snap blocks",
		icon: ASCircleLogo,
	});
}
