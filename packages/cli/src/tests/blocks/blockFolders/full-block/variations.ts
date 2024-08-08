import type { InterpretedAttributes } from "./attributes";
import type { BlockVariations } from "@atomicsmash/blocks-helpers";

/**
 * Variations declared here should be registered in index.tsx
 */
export const variations =
	[] as const satisfies BlockVariations<InterpretedAttributes>;
