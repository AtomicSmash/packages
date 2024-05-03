# WordPress Blocks Helpers

This package provides types which make build native WordPress blocks much easier. It is opinionated to our preferred way of writing blocks, and may not cover every use case or implementation.

## Main types and how to use them

### `registerBlockType`

This is the only piece of JS code in this package, and it is only used so the parameter types for the function are accurate. Simply replace the function imported from WP with this function.

Simple usage:

```ts
import type { Attributes } from "./versions/v1";
// Instead of import { registerBlockType } from "@wordpress/blocks";
import { registerBlockType } from "@atomicsmash/blocks-helpers";
import blockMetaData from "./block.json";
import { v1 } from "./versions/v1";

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType<Attributes>(blockMetaData.name, {
	...v1,
});
```

Full example include block deprecation:

```ts
import type { InterpretedAttributes as v1InterpretedAttributes } from "./versions/v1";
import type {
	Attributes,
	InterpretedAttributes as v2InterpretedAttributes,
} from "./versions/v2";
import { registerBlockType } from "@atomicsmash/blocks-helpers";
import blockMetaData from "./block.json";
import { v1 } from "./versions/v1";
import { v2 } from "./versions/v2";

type AllPossibleAttributes = v1InterpretedAttributes & v2InterpretedAttributes;

registerBlockType<Attributes, v2InterpretedAttributes, AllPossibleAttributes>(
	blockMetaData.name,
	{
		...v2,
		deprecated: [v1],
	},
);
```

### Attributes

```ts
import type {
	BlockAttributes,
	InterpretAttributes,
} from "@atomicsmash/blocks-helpers";
/**
 * Allows you to write block attributes with autocomplete and validation.
 * Prefer satisfies over type annotations for type narrowing.
 */
export const attributes = {
	someAttribute: {
		type: "string",
	},
} as const satisfies BlockAttributes;
export type Attributes = typeof attributes;
/**
 * This type helper interprets your attributes into what WordPress will
 * provide them to you as in your Edit / Save components.
 */
export type InterpretedAttributes = InterpretAttributes<Attributes>;
```

### Supports

```ts
import type { BlockSupports } from "@atomicsmash/blocks-helpers";
/**
 * Allows you to write block supports with autocomplete and validation.
 * Prefer satisfies over type annotations for type narrowing.
 */
export const supports = {
	anchor: true,
} as const satisfies BlockSupports;
export type Supports = typeof supports;
```

### Providing Context

```ts
import type {
	BlockProvidesContext,
	InterpretContext,
} from "@atomicsmash/blocks-helpers";
/**
 * Allows you to write block provides context with autocomplete and validation.
 * Prefer satisfies over type annotations for type narrowing.
 *
 * `Attributes` here is the same type as the attributes for the block as you
 * cannot provide context for anything except the attributes of your block.
 */
export const providesContext = {
	"namespace/someContextValue": "someAttribute",
} as const satisfies BlockProvidesContext<Attributes>;
export type ProvidesContext = typeof providesContext;
/**
 * This type helper interprets your context into what WordPress will
 * provide them to you as in your Edit component.
 * This is most commonly used to provide information to UsesContext.
 */
export type InterpretedContext = InterpretContext<Attributes, ProvidesContext>;
```

### Using Context

```ts
import type {
	BlockUsesContext,
	InterpretUsedContext,
} from "@atomicsmash/blocks-helpers";
import type { InterpretedContext as InterpretedContext1 } from "some-block";
import type { InterpretedContext as InterpretedContext2 } from "some-other-block";
/**
 * Allows you to write block uses context with autocomplete and validation.
 * Prefer satisfies over type annotations for type narrowing.
 *
 * InterpretedContext here is the type exported by the block providing context.
 * You can combine multiple types if using context from multiple blocks, it
 * will only output the types of the context you're actually using.
 */
type InterpretedContext = InterpretedContext1 & InterpretedContext2;
export const usesContext = [
	"namespace/someContextValue",
	"namespace/someContextValue2",
] as const satisfies BlockUsesContext<InterpretedContext>;
export type UsesContext = typeof usesContext;
export type InterpretedUsedContext = InterpretUsedContext<
	UsesContext,
	InterpretedContext
>;
```

### BlockEditProps

This type helper uses the types you created in the block definition to add prop types to your Edit function.

```tsx
import type { InterpretedAttributes, InterpretedUsedContext } from "./index";
import type { BlockEditProps } from "@atomicsmash/blocks-helpers";
import type { Element } from "@wordpress/element";

export function Edit({
	attributes,
	setAttributes,
	context,
}: BlockEditProps<InterpretedAttributes, InterpretedUsedContext>): Element {
	const { someAttribute } = attributes;
	setAttributes({ someAttribute: "Template block" });
	return (
		<>
			Attribute value: {someAttribute}
			Context value: {context["namespace/someContextValue"]}
		</>
	);
}
```

### BlockSaveProps

This type helper uses the types you created in the block definition to add prop types to your Save function.

```tsx
import type { InterpretedAttributes } from "./index";
import type { BlockSaveProps } from "@atomicsmash/blocks-helpers";
import type { Element } from "@wordpress/element";

export function Save({
	attributes,
}: BlockSaveProps<InterpretedAttributes>): Element {
	const { someAttribute } = attributes;
	return <>{someAttribute}</>;
}
```

### BlockDefinition

This is the combined type of the block definition so you can type check a single block version definition (with migrated blocks, you may have more that one definition for the same block)

```ts
import type { CurrentBlockDefinition } from "@atomicsmash/blocks-helpers";

export const v2 = {
	attributes,
	supports,
	edit: Edit,
	save: Save,
} satisfies CurrentBlockDefinition<Attributes, InterpretedAttributes>;
```

### Block deprecations

At some point you will need to update the version of a block to a new version. The `DeprecatedBlock` helper
can help you define the block, while `BlockMigrateDeprecationFunction` and
`BlockIsDeprecationEligibleFunction` can help you with the `migrate` and `isEligible` functions respectively.

```ts
import type { InterpretedAttributes as NewInterpretedAttributes } from "../v2/index";

// v1 attributes (InterpretedAttributes) defined here

const migrate: BlockMigrateDeprecationFunction<
	InterpretedAttributes,
	NewInterpretedAttributes
> = (attributes, innerBlocks) => {
	return []; // Your migration code here
};

const isEligible: BlockIsDeprecationEligibleFunction<InterpretedAttributes> = (
	attributes,
	innerBlocks,
) => {
	return true; // Is Eligible logic here
};

export const v1 = {
	attributes,
	supports,
	migrate,
	isEligible,
	save: Save,
	// note there is no Edit as this is not used.
} satisfies DeprecatedBlock<InterpretedAttributes>;
```

## Beta/untested types

- Block transforms
- Block examples
