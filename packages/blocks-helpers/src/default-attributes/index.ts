import { BlockSupports } from "@atomicsmash/blocks-helpers";
import { AlignAttribute } from "./align";
import { ClassNameAttribute } from "./className";
import { LayoutAttribute } from "./layout";
import { LockAttribute } from "./lock";
import { MetaDataAttribute } from "./metadata";
import { StyleAttribute } from "./style";

export type DefaultAttributes<Supports extends BlockSupports> =
	AlignAttribute<Supports> &
		ClassNameAttribute<Supports> &
		LayoutAttribute<Supports> &
		LockAttribute<Supports> &
		MetaDataAttribute<Supports> &
		StyleAttribute<Supports>;
