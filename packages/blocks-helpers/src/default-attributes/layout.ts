import type { AllPossibleLayouts } from "../layout";
import type { BlockSupports } from "@atomicsmash/blocks-helpers";

export type LayoutAttribute<Supports extends BlockSupports> = {
	layout?: Supports extends { layout?: false | undefined }
		? never
		: // If layout is not undefined or explicitly set to false, layout is supported.
			// It doesn't matter what the other settings are. If a setting is disabled it only means
			// the value doesn't have a UI control, it can still be set / changed via the code editor
			// This means every option is possible as a value and no assumptions should be made based
			// on support settings.
			AllPossibleLayouts;
};
