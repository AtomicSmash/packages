import { BlockSupports } from "..";

type NormalAlignment = "left" | "center" | "right";
type WideAlignment = "wide" | "full";
type AllAlignValues = NormalAlignment | WideAlignment;

export type AlignAttribute<Supports extends BlockSupports> = {
	align?: Supports extends {
		align: true;
	}
		? Supports extends { alignWide: false }
			? NormalAlignment
			: AllAlignValues
		: Supports extends { align: AllAlignValues[] }
			? Supports["align"][number]
			: never;
};
