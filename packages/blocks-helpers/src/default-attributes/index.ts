import { BlockSupports } from "@atomicsmash/blocks-helpers";
import { AlignAttribute } from "./align";
import { BackgroundAttribute } from "./background";
import { ClassNameAttribute } from "./className";
import { LayoutAttribute } from "./layout";
import { LockAttribute } from "./lock";

export type DefaultAttributes<Supports extends BlockSupports> =
	AlignAttribute<Supports> &
		BackgroundAttribute<Supports> &
		ClassNameAttribute<Supports> &
		LayoutAttribute<Supports> &
		LockAttribute<Supports>;
