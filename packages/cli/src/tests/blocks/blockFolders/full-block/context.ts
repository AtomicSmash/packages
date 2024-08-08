import type { InterpretedAttributes } from "./attributes";
import type {
	BlockProvidesContext,
	BlockUsesContext,
	InterpretProvidesContext,
	InterpretUsedContext,
} from "@atomicsmash/blocks-helpers";

export const providesContext =
	{} as const satisfies BlockProvidesContext<InterpretedAttributes>;
export type ProvidesContext = typeof providesContext;
export type InterpretedProvidesContext = InterpretProvidesContext<
	InterpretedAttributes,
	ProvidesContext
>;

// Import InterpretedProvidesContext from all the blocks that provide context
// and combine them together. Don't strip out extra properties if there are any.
// For blocks that don't output provides context types (e.g. core blocks),
// you should manually build the type to define what you expect the context
// to be.
type OtherBlocksInterpretedProvidesContext = Record<string, never>;

export const usesContext =
	[] as const satisfies BlockUsesContext<OtherBlocksInterpretedProvidesContext>;
export type UsesContext = typeof usesContext;
export type InterpretedUsedContext = InterpretUsedContext<
	UsesContext,
	OtherBlocksInterpretedProvidesContext
>;
