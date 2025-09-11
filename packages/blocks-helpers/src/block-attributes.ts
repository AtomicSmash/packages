import type { BlockSupports } from "./block-supports";
import type { DefaultAttributes } from "./default-attributes";
import type { AllHTMLAttributes } from "react";
export type AttributeTypes =
	| "null"
	| "boolean"
	| "object"
	| "array"
	| "string"
	| "integer"
	| "number";

type AllAttributes = AllHTMLAttributes<HTMLElement>;
type BooleanAttributeTypes = {
	[Property in keyof AllAttributes]-?: Required<AllAttributes>[Property] extends boolean
		? Property
		: never;
}[keyof AllAttributes];

type AttributeSourceBooleanAttribute = {
	type: "boolean" | ["boolean"];
	enum?: readonly boolean[];
	source: "attribute";
	selector: string;
	attribute: BooleanAttributeTypes;
	default?: boolean;
};

type AttributeSourceStringAttribute = {
	type: "string" | ["string"];
	enum?: readonly string[];
	source: "attribute";
	selector: string;
	attribute: string;
	default?: string;
};

type TextSourceAttribute = {
	type: "string" | ["string"];
	enum?: readonly string[];
	source: "text";
	selector: string;
	default?: string;
};

type HTMLSourceAttribute = {
	type: "string" | ["string"];
	enum?: readonly string[];
	source: "html";
	selector: string;
	default?: string;
};

type QuerySourceAttribute = {
	type: "array" | ["array"];
	source: "query";
	selector: string;
	query: Record<string, AttributesObject>;
	default?: Record<string, unknown>[];
	enum?: Record<string, unknown>[];
};

type MetaSourceAttribute = {
	type: "string" | ["string"];
	enum?: readonly string[];
	/**
	 * @deprecated
	 */
	source: "meta";
	meta: string;
	default?: string;
};

type NoSourceAttributeArrayType = {
	type: "array" | ["array"];
	source?: never;
	enum?: unknown[];
	default?: unknown[];
};

type NoSourceAttributeAnyType = {
	type: Exclude<AttributeTypes, "array"> | Exclude<AttributeTypes, "array">[];
	enum?: readonly boolean[] | readonly number[] | readonly string[];
	source?: never;
	default?: unknown;
};

export type AttributesObject = (
	| AttributeSourceBooleanAttribute
	| AttributeSourceStringAttribute
	| TextSourceAttribute
	| HTMLSourceAttribute
	| QuerySourceAttribute
	| MetaSourceAttribute
	| NoSourceAttributeArrayType
	| NoSourceAttributeAnyType
) & { role?: "content" | "local" };

type InheritType<Type extends { type: string | string[]; default?: unknown }> =
	Type extends {
		type: string[];
	}
		? unknown[]
		: Type extends {
					type: "string";
			  }
			? string
			: Type extends { type: "boolean" }
				? boolean
				: Type extends { type: "object" }
					? Type["default"] extends Record<string, unknown> | undefined
						? Type["default"]
						: Record<string, unknown> | undefined
					: Type extends { type: "null" }
						? null
						: Type extends { type: "array" }
							? Type["default"] extends unknown[] | undefined
								? Type["default"]
								: unknown[] | undefined
							: Type extends { type: "integer" }
								? number
								: Type extends { type: "number" }
									? number
									: never;

export type BlockAttributes = Readonly<Record<string, AttributesObject>>;

export type InterpretAttributesWithoutDefaults<
	Attributes extends BlockAttributes,
> = {
	[Property in keyof Attributes]: Attributes[Property] extends {
		enum: NonNullable<Attributes[Property]["enum"]>;
	}
		? NonNullable<Attributes[Property]["enum"]>[number]
		: Attributes[Property] extends {
					type: "array";
					query: Record<string, AttributesObject>;
			  }
			? InterpretAttributesWithoutDefaults<
					NonNullable<Attributes[Property]["query"]>
				>[]
			: Attributes[Property] extends { type: string }
				? InheritType<Attributes[Property]>
				: never;
};
export type InterpretAttributes<
	Supports extends BlockSupports,
	Attributes extends BlockAttributes,
> = InterpretAttributesWithoutDefaults<Attributes> &
	DefaultAttributes<Supports>;
