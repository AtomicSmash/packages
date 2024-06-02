import { BlockSupports } from "@atomicsmash/blocks-helpers";

export type ClassNameAttribute<Supports extends BlockSupports> = {
	className?: Supports extends { customClassName: false } ? never : string;
};
