import type {
	BlockProvidesContext,
	BlockUsesContext,
	InterpretProvidesContext,
	InterpretUsedContext,
} from "@atomicsmash/blocks-helpers";
import { type Attributes } from "./attributes";

export const providesContext =
	{} as const satisfies BlockProvidesContext<Attributes>;
export type ProvidesContext = typeof providesContext;
export type InterpretedProvidesContext = InterpretProvidesContext<
	Attributes,
	ProvidesContext
>;

// Import InterpretedProvidesContext from the block that provides context
// For blocks that don't output provides context types (e.g. core blocks),
// you can manually build the type.
type OtherBlocksInterpretedProvidesContext = InterpretedProvidesContext;

export const usesContext =
	[] as const satisfies BlockUsesContext<OtherBlocksInterpretedProvidesContext>;
export type UsesContext = typeof usesContext;
export type InterpretedUsedContext = InterpretUsedContext<
	UsesContext,
	OtherBlocksInterpretedProvidesContext
>;
