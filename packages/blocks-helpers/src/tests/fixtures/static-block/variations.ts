import type { BlockVariations } from "@atomicsmash/blocks-helpers";
import { type Attributes } from "./attributes";
import { type Supports } from "./supports";

export const variations = [] as const satisfies BlockVariations<
	Supports,
	Attributes
>;
