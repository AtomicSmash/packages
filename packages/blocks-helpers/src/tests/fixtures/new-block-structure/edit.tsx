import type { BlockEditProps as CreateBlockEditProps } from "@atomicsmash/blocks-helpers";
import { type Attributes } from "./attributes";
import { type InterpretedUsedContext } from "./context";
import { type Supports } from "./supports";

export type BlockEditProps = CreateBlockEditProps<
	Supports,
	Attributes,
	InterpretedUsedContext
>;

export function Edit() {
	return <div></div>;
}
