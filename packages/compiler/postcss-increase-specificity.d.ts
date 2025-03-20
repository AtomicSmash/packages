declare module "postcss-increase-specificity" {
	import type { Plugin } from "postcss";

	export default function (options: {
		repeat?: number;
		overrideIds?: boolean;
		stackableRoot?: string;
	}): Plugin;
}
