declare module "postcss-plugin-context" {
	import type { Plugin } from "postcss";
	export default function (options: Record<string, Plugin>): Plugin;
}
