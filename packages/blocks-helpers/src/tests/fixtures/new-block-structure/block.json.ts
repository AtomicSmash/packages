import type { BlockMetaData } from "@atomicsmash/blocks-helpers";
import { type Attributes, attributes } from "./attributes";
import { providesContext, usesContext } from "./context";
import { example } from "./example";
import { type Supports, supports } from "./supports";
import { variations } from "./variations";

export const blockJson = {
	apiVersion: 3,
	name: "namespace/block-name",
	version: "",
	title: "Block title",
	category: "",
	description: "",
	textdomain: "",
	keywords: [],
	editorScript: "file:./index.ts",
	viewScript: "file:./view.ts",
	style: "file:./style.scss",
	editorStyle: "file:./editor-style.scss",
	render: "file:./render.php",
	attributes,
	providesContext,
	usesContext,
	example,
	supports,
	variations,
} satisfies BlockMetaData<Supports, Attributes>;
export default blockJson;
