import { BlockSupports } from "@atomicsmash/blocks-helpers";

export type StyleAttribute<Supports extends BlockSupports> = {
	style?: BackgroundImageAttribute<Supports["background"]> &
		BackgroundSizeAttribute<Supports["background"]> &
		SpacingMarginAttribute<Supports["spacing"]> &
		SpacingPaddingAttribute<Supports["spacing"]> &
		SpacingBlockGapAttribute<Supports["spacing"]> extends never
		? never
		: {
				background?: BackgroundImageAttribute<Supports["background"]> &
					BackgroundSizeAttribute<Supports["background"]>;
				spacing?: SpacingMarginAttribute<Supports["spacing"]> &
					SpacingPaddingAttribute<Supports["spacing"]> &
					SpacingBlockGapAttribute<Supports["spacing"]>;
			};
};
type BackgroundImageAttribute<Spacing extends BlockSupports["background"]> =
	Spacing extends undefined
		? never
		: Spacing extends { backgroundImage: false }
			? never
			: {
					backgroundImage?: {
						url: string;
						id: number;
						source: string;
						title: string;
					};
				};
type BackgroundSizeAttribute<Spacing extends BlockSupports["background"]> =
	Spacing extends undefined
		? never
		: Spacing extends { backgroundSize: false }
			? never
			: {
					backgroundPosition?: string;
				};

type SpacingMarginAttribute<Spacing extends BlockSupports["spacing"]> =
	Spacing extends undefined
		? never
		: Spacing extends { margin: false }
			? never
			: Spacing extends { margin: undefined }
				? never
				: {
						margin: {
							bottom?: string;
							left?: string;
							right?: string;
							top?: string;
						};
					};

type SpacingPaddingAttribute<Spacing extends BlockSupports["spacing"]> =
	Spacing extends undefined
		? never
		: Spacing extends { padding: false }
			? never
			: Spacing extends { padding: undefined }
				? never
				: {
						padding: {
							bottom?: string;
							left?: string;
							right?: string;
							top?: string;
						};
					};

type SpacingBlockGapAttribute<Spacing extends BlockSupports["spacing"]> =
	Spacing extends undefined
		? never
		: Spacing extends { blockGap: false }
			? never
			: Spacing extends { blockGap: undefined }
				? never
				: Spacing extends { blockGap: ["horizontal"] }
					? {
							blockGap: { left: string };
						}
					: Spacing extends { blockGap: ["vertical"] }
						? {
								blockGap: { top: string };
							}
						: {
								blockGap: string;
							};
