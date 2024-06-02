import { BlockSupports } from "..";
import { AlignAttribute } from "./align";
import { BackgroundAttribute } from "./background";
import { ClassNameAttribute } from "./className";
import { LockAttribute } from "./lock";

export type DefaultAttributes<Supports extends BlockSupports> =
	AlignAttribute<Supports> &
		BackgroundAttribute<Supports> &
		ClassNameAttribute<Supports> &
		LockAttribute<Supports>;
