import { BlockSupports } from "@atomicsmash/blocks-helpers";

export type MetaDataAttribute<Supports extends BlockSupports> = {
	metadata?: MetaDataNameAttribute<
		Supports["renaming"] extends undefined ? true : Supports["renaming"]
	>;
};

type MetaDataNameAttribute<Renaming extends BlockSupports["renaming"]> =
	Renaming extends true | undefined
		? {
				name?: string;
			}
		: never;
