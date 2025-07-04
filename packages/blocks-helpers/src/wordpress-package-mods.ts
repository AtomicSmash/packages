/**
 * This file exists to enable type safety for WordPress imports where
 * types are not defined or not defined correctly by the packages themselves (either First or
 * Third party types).
 *
 * The types here are manually created based on documentation, and
 * efforts should be made to ensure that types declared here are kept
 * up to date to avoid runtime errors which don't trigger type errors.
 */
import type {
	BlockInstanceAsObject,
	BlockMetaData,
	BlockVariations,
	ClientOnlyRegisterOptions,
	InterpretAttributes,
	BlockSupports as FixedBlockSupports,
	BlockAttributes as FixedBlockAttributes,
} from "./index";
import type { Dropdown } from "@wordpress/components";
import type { Context, ComponentProps, ReactNode } from "react";

type LayoutTypes = {
	type: "default";
} & {
	type: "flex";
} & {
	type: "grid";
} & {
	type: "constrained";
};

type SelectedImage = {
	url: string;
	alt: string;
	id: number;
	link: string;
	caption: string;
	sizes: Record<
		string,
		{
			height: number;
			width: number;
			orientation: "portrait" | "landscape";
			url: string;
		}
	>;
	mime: string;
	subtype: string;
	type: string;
};

// type LinkSettings = {
// 	url: string;
// 	title?: string;
// 	opensInNewTab?: boolean;
// };

declare module "@wordpress/block-editor" {
	const BlockContextProvider: Context<Record<string, unknown>>["Provider"];
	// eslint-disable-next-line @typescript-eslint/naming-convention -- Wordpress Provided Function
	const __experimentalUseBlockPreview: (props: {
		blocks: BlockInstanceAsObject[];
		props?: Record<string, unknown>;
		layout?: LayoutTypes;
	}) => Record<string, unknown>;
	const BlockPreview: (props: {
		blocks?: BlockInstanceAsObject[];
		viewportWidth?: number;
		minHeight?: number;
		additionalStyles?: { css: string }[];
	}) => JSX.Element;

	// eslint-disable-next-line @typescript-eslint/naming-convention -- Wordpress Provided Function
	const __experimentalLinkControl: (props: {
		value?: {
			url: string;
			title?: string;
			opensInNewTab?: boolean;
		};
		settings?: {
			id: string;
			title: string;
		}[];
		onChange: (newValue: {
			url: string;
			title?: string;
			opensInNewTab?: boolean;
		}) => void;
		showSuggestions?: boolean;
		showInitialSuggestions?: boolean;
		suggestionsQuery?: Record<string, unknown>;
		forceIsEditingLink?: boolean;
		createSuggestion?: (inputText: string) =>
			| {
					url: string;
					title?: string;
					opensInNewTab?: boolean;
			  }
			| Promise<{
					url: string;
					title?: string;
					opensInNewTab?: boolean;
			  }>;
		onRemove?: () => void;
		renderControlBottom?: () => void;
	}) => JSX.Element;

	// eslint-disable-next-line @typescript-eslint/no-namespace -- Namespace must be used to match types package
	namespace InnerBlocks {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Interface is needed as per the existing types.
		interface Props {
			/**
			 * `allowedBlocks` can contain an array of strings, each string should contain the identifier of a block.
			 * When `allowedBlocks` is set it is only possible to insert blocks part of the set specified in the array.
			 *
			 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/inner-blocks/README.md#allowedblocks;
			 */
			// @ts-expect-error We're overwriting the namespace from the package so it must be different.
			allowedBlocks?: boolean | string[];
			__unstableDisableLayoutClassNames?: boolean;
			__unstableDisableDropZone?: boolean;
			dropZoneElement?: HTMLElement;
			/**
			 * Determines whether the toolbars of all child Blocks (applied deeply, recursive) should have their
			 * toolbars "captured" and shown on the Block which is consuming InnerBlocks.
			 * For example, a button block, deeply nested in several levels of block X that utilizes this property
			 * will see the button block's toolbar displayed on block X's toolbar area.
			 *
			 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/inner-blocks/README.md#__experimentalcapturetoolbars
			 */
			__experimentalCaptureToolbars?: boolean;
			/**
			 * Determines which block type should be inserted by default and any attributes that should be
			 * set by default when the block is inserted.
			 *
			 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/inner-blocks/README.md#defaultblock
			 */
			defaultBlock?: BlockInstanceAsObject;
			/**
			 * Determines whether the default block should be inserted directly into the InnerBlocks area by the block appender.
			 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/inner-blocks/README.md#directinsert
			 */
			directInsert?: boolean;
		}
	}

	const useSettings: <Paths extends string[]>(...paths: Paths) => unknown[];

	const MediaReplaceFlow: <Multiple extends boolean>(
		props: {
			mediaURL?: string;
			allowedTypes: string[];
			accept?: string;
			onError?: (message: string) => void;
			onSelectURL?: () => void;
			onReset?: () => void;
			onToggleFeaturedImage?: () => void;
			useFeaturedImage?: boolean;
			onFilesUpload?: () => void;
			name?: string;
			createNotice?: () => void;
			removeNotice?: () => void;
			children?: ReactNode;
			multiple?: Multiple;
			addToGallery: boolean;
			handleUpload?: boolean;
			popoverProps?: ComponentProps<typeof Dropdown>["popoverProps"];
			renderToggle?: (args: {
				"aria-expanded": boolean;
				"aria-haspopup": "true";
				onClick: () => void;
				onKeyDown: (event: KeyboardEvent) => void;
				children: ReactNode;
			}) => void;
		} & (Multiple extends true
			? {
					mediaIds?: number[];
					onSelect: (selectedImages: SelectedImage[]) => void;
				}
			: {
					mediaId?: number;
					onSelect: (selectedImage: SelectedImage) => void;
				}),
	) => JSX.Element;
}

declare module "@wordpress/blocks" {
	// @ts-expect-error We're overwriting the function from the package.
	const registerBlockVariation: <
		InterpretedAttributes extends Record<string, unknown>,
	>(
		name: string,
		variations: BlockVariations<InterpretedAttributes>[number],
	) => void;

	// @ts-expect-error We're overwriting the function from the package.
	const registerBlockType: <
		Supports extends FixedBlockSupports,
		Attributes extends FixedBlockAttributes,
		InterpretedUsedContext extends Record<string, unknown> = Record<
			string,
			never
		>,
		InterpretedAttributes extends InterpretAttributes<
			Supports,
			Attributes
		> = InterpretAttributes<Supports, Attributes>,
	>(
		name: string,
		settings: ClientOnlyRegisterOptions<
			InterpretedAttributes,
			InterpretedUsedContext
		>,
	) => BlockMetaData<Supports, Attributes> &
		ClientOnlyRegisterOptions<InterpretedAttributes, InterpretedUsedContext>;
}
