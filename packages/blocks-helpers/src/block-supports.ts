import type { AllPossibleLayouts } from "./layout";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type BlockSupports = Record<string, any> & {
	anchor?: boolean;
	align?: boolean | ("wide" | "full" | "left" | "center" | "right")[];
	alignWide?: boolean;
	ariaLabel?: boolean;
	background?: {
		backgroundImage?: boolean;
		backgroundSize?: boolean;
	};
	className?: boolean;
	color?:
		| {
				background?: boolean;
				button?: boolean;
				enableContrastChecker?: boolean;
				gradients?: boolean;
				heading?: boolean;
				link?: boolean;
				text?: boolean;
				/**
				 * @deprecated Use `filter.duotone` instead.
				 *
				 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/#filter-duotone
				 */
				__experimentalDuotone?: boolean;
		  }
		| boolean;
	customClassName?: boolean;
	dimensions?: {
		aspectRatio?: boolean;
		minHeight?: boolean;
	};
	filter?: {
		duotone?: boolean;
	};
	html?: boolean;
	inserter?: boolean;
	interactivity?:
		| boolean
		| {
				clientNavigation?: boolean;
				interactive?: boolean;
		  };
	layout?:
		| boolean
		| {
				default?: AllPossibleLayouts;
				allowSwitching?: boolean;
				allowEditing?: boolean;
				allowInheriting?: boolean;
				allowSizingOnChildren?: boolean;
				allowVerticalAlignment?: boolean;
				allowJustification?: boolean;
				allowOrientation?: boolean;
				allowCustomContentAndWideSize?: boolean;
		  };
	lock?: boolean;
	multiple?: boolean;
	position?: {
		sticky?: boolean;
	};
	renaming?: boolean;
	reusable?: boolean;
	shadow?: boolean;
	spacing?: {
		margin?:
			| boolean
			| ("top" | "right" | "left" | "bottom")[]
			| ("vertical" | "horizontal")[];
		padding?:
			| boolean
			| ("top" | "right" | "left" | "bottom")[]
			| ("vertical" | "horizontal")[];
		blockGap?: boolean | ("vertical" | "horizontal")[];
	};
	typography?: {
		fontSize?: boolean;
		lineHeight?: boolean;
		textAlign?: boolean | ("left" | "center" | "right")[];
	};
};
