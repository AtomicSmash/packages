import type { Supports, Attributes } from "./versions/v2/index";
import { registerBlockType } from "@atomicsmash/blocks-helpers";
import { v1 } from "./versions/v1/index";
import { v2 } from "./versions/v2/index";

registerBlockType<Supports, Attributes>("deprecated-block", {
	...v2,
	deprecated: [v1],
});
