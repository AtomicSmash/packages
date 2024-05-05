import type { BlockMetaData } from "@atomicsmash/blocks-helpers";
import { type Attributes, attributes } from "./attributes";
import { type Supports, supports } from "./supports";

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
	style: "file:./style.scss",
	attributes,
	supports,
} satisfies BlockMetaData<Supports, Attributes>;
export default blockJson;
