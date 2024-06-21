export type FlowLayout = { type: "default" }; // This is "flow", "flow" is not supported as a type and will throw an error if used.
export type ConstrainedLayout = {
	type: "constrained";
	justifyContent?: "left" | "center" | "right";
	contentSize?: string;
	wideSize?: string;
};
export type FlexLayout = {
	type: "flex";
	flexWrap?: "wrap" | "nowrap";
} & (
	| {
			orientation?: "horizontal";
			justifyContent?: "left" | "center" | "right" | "space-between";
			verticalAlignment?: "top" | "center" | "bottom" | "stretch";
	  }
	| {
			orientation: "vertical";
			justifyContent?: "left" | "center" | "right" | "stretch";
			verticalAlignment?: "top" | "center" | "bottom" | "space-between";
	  }
);
export type GridLayout = {
	type: "grid";
} & (
	| {
			minimumColumnWidth?: string;
			columnCount?: never;
	  }
	| {
			minimumColumnWidth?: never;
			columnCount?: number;
	  }
);

export type AllPossibleLayouts =
	| FlowLayout
	| FlexLayout
	| GridLayout
	| ConstrainedLayout;
