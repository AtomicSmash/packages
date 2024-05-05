import type { BlockSupports } from "@atomicsmash/blocks-helpers";

export const supports = {} as const satisfies BlockSupports;
export type Supports = typeof supports;
