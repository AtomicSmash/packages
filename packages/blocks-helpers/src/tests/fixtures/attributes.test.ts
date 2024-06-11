/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BlockAttributes } from "@atomicsmash/blocks-helpers";

export const attributeTypesAndEnumsTests = {
	typeString: {
		type: "string",
	},
	typeBoolean: {
		type: "boolean",
	},
	typeObject: {
		type: "object",
	},
	typeArray: {
		type: "array",
	},
	typeNull: {
		type: "null",
	},
	typeInteger: {
		type: "integer",
	},
	typeNumber: {
		type: "number",
	},
	multipleTypes: {
		type: ["string", "boolean", "object", "null", "integer", "number"],
	},
	enumBoolean: {
		type: "boolean",
		enum: [true, false],
	},
	enumNumber: {
		type: "number",
		enum: [1, 2, 3],
	},
	enumString: {
		type: "string",
		enum: ["string", "anotherString"],
	},
	// @ts-expect-error Must specify a type to be valid
	requireType: {},
} as const satisfies BlockAttributes;

const attributeSourceTests = {
	fullValidAttribute: {
		source: "attribute",
		type: "string",
		selector: ".some-element",
		attribute: "data-attribute",
		default: "string",
	},
	fullValidBooleanAttribute: {
		source: "attribute",
		type: "boolean",
		selector: ".some-element",
		attribute: "disabled",
		default: false,
	},
	// @ts-expect-error Selector and attribute property must be present
	missingSelectorAndAttributeProperty: {
		source: "attribute",
		type: "string",
	},
	// @ts-expect-error Selector must be present
	missingSelector: {
		source: "attribute",
		type: "string",
		attribute: "data-attribute",
	},
	// @ts-expect-error Attribute property must be present
	missingAttributeProperty: {
		source: "attribute",
		type: "string",
		selector: ".some-element",
	},
	// @ts-expect-error If type is set to boolean, you must choose a boolean HTML attribute.
	ifTypeBooleanBooleanAttributeRequired: {
		source: "attribute",
		type: "boolean",
		selector: ".some-element",
		attribute: "href",
	},
	// @ts-expect-error If type is set to boolean, you must choose a boolean HTML attribute.
	ifTypeBooleanBooleanDefaultRequired: {
		source: "attribute",
		type: "boolean",
		selector: ".some-element",
		attribute: "disabled",
		default: "string",
	},
	// @ts-expect-error If type is set to boolean, you must choose a boolean HTML attribute.
	ifTypeStringStringDefaultRequired: {
		source: "attribute",
		type: "string",
		selector: ".some-element",
		attribute: "disabled",
		default: true,
	},
} as const satisfies BlockAttributes;

const textSourceTests = {
	fullValidAttribute: {
		source: "text",
		type: "string",
		selector: ".some-element",
		default: "string",
	},
	// @ts-expect-error Type must be string
	invalidType: {
		source: "text",
		type: "boolean",
		selector: ".some-element",
	},
	// @ts-expect-error Selector must be present
	missingSelector: {
		source: "text",
		type: "string",
	},
} as const satisfies BlockAttributes;

const HTMLSourceTests = {
	fullValidAttribute: {
		type: "string",
		source: "html",
		selector: ".some-element",
	},
	// @ts-expect-error Type must be string
	invalidType: {
		source: "html",
		type: "boolean",
		selector: ".some-element",
	},
	// @ts-expect-error Selector must be present
	missingSelector: {
		source: "html",
		type: "string",
	},
} as const satisfies BlockAttributes;

const querySourceTests = {
	fullValidAttribute: {
		type: "array",
		source: "query",
		selector: ".some-element",
		query: {
			nestedAttribute: {
				type: "string",
			},
		},
		default: [
			{
				nestedAttribute: "string",
			},
			{
				nestedAttribute: "another string",
			},
		],
	},
	// @ts-expect-error Type must be an array
	invalidType: {
		source: "query",
		type: "string",
		selector: ".some-element",
	},
	// @ts-expect-error Selector and query must be present
	missingSelectorAndQuery: {
		source: "query",
		type: "array",
	},
	// @ts-expect-error Selector must be present
	missingSelector: {
		source: "query",
		type: "array",
		query: {
			nestedAttribute: {
				type: "string",
			},
		},
	},
	// @ts-expect-error Query must be present
	missingSelector: {
		source: "query",
		type: "array",
		selector: ".some-element",
	},
} as const satisfies BlockAttributes;

/**
 * Meta source was deprecated before these tests were created, so
 * these tests are deliberately lacking as they are not worth the
 * time investment.
 */
const metaSourceTests = {
	fullValidAttribute: {
		type: "string",
		source: "meta",
		meta: "author",
	},
} as const satisfies BlockAttributes;

const noSourceTests = {
	fullValidAttribute: {
		type: "string",
		default: "string",
	},
	fullValidArrayTypeAttribute: {
		type: "array",
		default: ["string"],
	},
} as const satisfies BlockAttributes;
