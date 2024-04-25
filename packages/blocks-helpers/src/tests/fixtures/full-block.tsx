import type {
	BlockAttributes,
	BlockSupports,
	InterpretAttributes,
	BlockEditProps as CreateBlockEditProps,
	BlockSaveProps as CreateBlockSaveProps,
	BlockProvidesContext,
	InterpretProvidesContext,
	BlockUsesContext,
	InterpretUsedContext,
	CurrentStaticBlockDefinition,
} from "@atomicsmash/blocks-helpers";
import type { Element } from "@wordpress/element";
import { registerBlockType } from "@atomicsmash/blocks-helpers";
import {
	useBlockProps,
	RichText,
	AlignmentToolbar,
	BlockControls,
	InspectorControls,
} from "@wordpress/block-editor";
import {
	TextControl,
	SelectControl,
	Panel,
	PanelBody,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export const attributes = {
	url: {
		type: "string",
		source: "attribute",
		selector: "img",
		attribute: "src",
	},
	title: {
		type: "string",
	},
	size: {
		enum: ["small", "large"],
		default: "small",
	},
	align: {
		type: "string",
		default: "none",
	},
} as const satisfies BlockAttributes;
export type Attributes = typeof attributes;
export type InterpretedAttributes = InterpretAttributes<Attributes>;

export const supports = {} as const satisfies BlockSupports;
export type Supports = typeof supports;

export const providesContext = {
	"namespace/url": "url",
} as const satisfies BlockProvidesContext<Attributes>;
export type ProvidesContext = typeof providesContext;
export type InterpretedContext = InterpretProvidesContext<
	Attributes,
	ProvidesContext
>;

// Usually the `InterpretedContext` here would be imported from
// another block, but for testing, we're short circuiting.
type OtherBlockInterpretedContext = InterpretedContext;

export const usesContext = [
	"namespace/url",
] as const satisfies BlockUsesContext<OtherBlockInterpretedContext>;
export type UsesContext = typeof usesContext;
export type InterpretedUsedContext = InterpretUsedContext<
	UsesContext,
	OtherBlockInterpretedContext
>;

export type BlockEditProps = CreateBlockEditProps<
	Supports,
	Attributes,
	InterpretedUsedContext
>;
export type BlockSaveProps = CreateBlockSaveProps<Supports, Attributes>;

export function Edit({ attributes, setAttributes }: BlockEditProps): Element {
	const { title, url, align, size } = attributes;
	const blockProps = useBlockProps({ className: `align-${align}` });

	return (
		<>
			<BlockControls>
				<AlignmentToolbar
					value={align}
					onChange={(newAlign: InterpretedAttributes["align"]) => {
						setAttributes({
							align: newAlign ?? "none",
						});
					}}
				/>
			</BlockControls>
			<InspectorControls>
				<Panel>
					<PanelBody title="Block settings">
						<SelectControl
							label="Block size"
							value={size}
							options={[
								{
									label: "Small",
									value: "small",
								},
								{
									label: "Large",
									value: "large",
								},
							]}
							onChange={(newSize) => {
								setAttributes({
									size: newSize as InterpretedAttributes["size"],
								});
							}}
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<div {...blockProps}>
				<RichText
					tagName="h2"
					onChange={(newTitle: InterpretedAttributes["title"]) => {
						setAttributes({ title: newTitle });
					}}
					allowedFormats={["core/bold", "core/italic"]}
					value={title}
					placeholder={__("Write your title…")}
				/>
				<TextControl
					label="Image URL"
					help="Enter an image URL here to display it on the front end."
					value={url}
					onChange={(newImageURL: InterpretedAttributes["url"]) => {
						setAttributes({ url: newImageURL });
					}}
				/>
			</div>
		</>
	);
}

export function Save({ attributes }: BlockSaveProps): Element {
	const { title, url, align, size } = attributes;
	const blockProps = useBlockProps.save({
		className: `align-${align} blockSize-${size}`,
	});
	return (
		<div {...blockProps}>
			<RichText.Content tagName="h2" value={title} />
			<img src={url} alt="" />
		</div>
	);
}

const v1 = {
	attributes,
	supports,
	providesContext,
	usesContext,
	edit: Edit,
	save: Save,
} satisfies CurrentStaticBlockDefinition<
	Supports,
	Attributes,
	InterpretedUsedContext
>;

registerBlockType<Supports, Attributes, InterpretedUsedContext>(
	"simple-block",
	{
		...v1,
	},
);
