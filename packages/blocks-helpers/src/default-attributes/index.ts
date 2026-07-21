import type { AlignAttribute } from "./align";
import type { ClassNameAttribute } from "./className";
import type { LayoutAttribute } from "./layout";
import type { LockAttribute } from "./lock";
import type { MetaDataAttribute } from "./metadata";
import type { StyleAttribute } from "./style";
import type { BlockSupports } from "@atomicsmash/blocks-helpers";

export type DefaultAttributes<Supports extends BlockSupports> =
	AlignAttribute<Supports> &
		ClassNameAttribute<Supports> &
		LayoutAttribute<Supports> &
		LockAttribute<Supports> &
		MetaDataAttribute<Supports> &
		StyleAttribute<Supports>;
