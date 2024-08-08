import type { InterpretedAttributes } from "./attributes";
import type {
	AllDeprecations,
	// BlockSupports,
	// BlockAttributes,
	// DeprecationAndFixture,
} from "@atomicsmash/blocks-helpers";
// import { attributes as currentAttributes } from "./attributes";
// import { supports as currentSupports } from "./supports";

// // edit attributes to what they were in v1
// const v1Attributes = {
// 	...currentAttributes,
// } as const satisfies BlockAttributes;
// type V1Attributes = typeof v1Attributes;

// // edit supports to what they were in v1
// const v1Supports = { ...currentSupports } as const satisfies BlockSupports;
// type V1Supports = typeof v1Supports;

// const v1 = {} as const satisfies DeprecationAndFixture<
// 	V1Supports,
// 	V1Attributes,
// 	InterpretedAttributes
// >;

export const deprecated =
	[] as const satisfies AllDeprecations<InterpretedAttributes>;
