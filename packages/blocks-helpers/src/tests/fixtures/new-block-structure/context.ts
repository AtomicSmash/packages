import {
	BlockProvidesContext,
	BlockUsesContext,
	InterpretProvidesContext,
	InterpretUsedContext,
} from "@atomicsmash/blocks-helpers";
import { type Attributes } from "./attributes";
// Usually InterpretedContext is imported from another block.
import { type InterpretedProvidesContext as OtherBlocksInterpretedProvidesContext } from "./index";

export const providesContext =
	{} as const satisfies BlockProvidesContext<Attributes>;
export type ProvidesContext = typeof providesContext;
export type InterpretedProvidesContext = InterpretProvidesContext<
	Attributes,
	ProvidesContext
>;

export const usesContext =
	[] as const satisfies BlockUsesContext<OtherBlocksInterpretedProvidesContext>;
export type UsesContext = typeof usesContext;
export type InterpretedUsedContext = InterpretUsedContext<
	UsesContext,
	OtherBlocksInterpretedProvidesContext
>;
