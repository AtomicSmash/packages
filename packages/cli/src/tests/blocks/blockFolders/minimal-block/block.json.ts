import type { Attributes } from "./attributes";
import type { Supports } from "./supports";
import type { BlockMetaData } from "@atomicsmash/blocks-helpers";
import { attributes } from "./attributes";
import { supports } from "./supports";

export const blockJson = {
	apiVersion: 3,
	name: "cloudcall-blocks/minimal-block",
	title: "Minimal block",
	category: "theme",
	description: "This is a block with a minimal amount of properties set.",
	textdomain: "cloudcall",
	editorScript: "file:./index.tsx",
	attributes,
	supports,
} satisfies BlockMetaData<Supports, Attributes>;
export default blockJson;
