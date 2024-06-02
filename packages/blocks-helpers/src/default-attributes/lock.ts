import { BlockSupports } from "@atomicsmash/blocks-helpers";

export type LockAttribute<Supports extends BlockSupports> = {
	lock?: Supports extends { lock: false }
		? never
		: { move: boolean; remove: boolean };
};
