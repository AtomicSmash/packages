import type { Attributes } from "./attributes";
import type { Supports } from "./supports";
import type { BlockMetaData } from "@atomicsmash/blocks-helpers";
import { attributes } from "./attributes";
import { providesContext, usesContext } from "./context";
import { example } from "./example";
import { supports } from "./supports";

export const blockJson = {
	apiVersion: 3,
	name: "cloudcall-blocks/full-block",
	version: "",
	title: "Full block",
	category: "theme",
	description:
		"This is a test block with all possible properties set to a value.",
	textdomain: "cloudcall",
	keywords: [],
	editorScript: "file:./index.tsx",
	viewScript: "file:./view.ts",
	style: "file:./style.scss",
	editorStyle: "file:./editor-style.scss",
	viewStyle: "file:./viewStyle.scss",
	render: "file:./render.php",
	allowedBlocks: [],
	ancestor: [],
	parent: [],
	styles: [],
	variations: [],
	attributes,
	providesContext,
	usesContext,
	example,
	supports,
} satisfies BlockMetaData<Supports, Attributes>;
export default blockJson;
