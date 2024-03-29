import type { InterpretedAttributes as InterpretedAttributesV1 } from "./versions/v1/index";
import type {
	Attributes,
	InterpretedAttributes as InterpretedAttributesV2,
} from "./versions/v2/index";
import { registerBlockType } from "@atomicsmash/blocks-helpers";
import { v1 } from "./versions/v1/index";
import { v2 } from "./versions/v2/index";

registerBlockType<
	Attributes,
	InterpretedAttributesV2,
	InterpretedAttributesV1 & InterpretedAttributesV2
>("deprecated-block", {
	...v2,
	deprecated: [v1],
});
