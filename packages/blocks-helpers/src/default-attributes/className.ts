import { BlockSupports } from "..";

export type ClassNameAttribute<Supports extends BlockSupports> = {
	className?: Supports extends { customClassName: false } ? never : string;
};
