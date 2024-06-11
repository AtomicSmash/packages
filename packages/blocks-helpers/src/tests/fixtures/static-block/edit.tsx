import type { InterpretedAttributes } from "./attributes";
import type { InterpretedUsedContext } from "./context";
import type { CreateBlockEditProps } from "@atomicsmash/blocks-helpers";
import {
	useBlockProps,
	RichText,
	AlignmentToolbar,
	BlockControls,
	InspectorControls,
	InnerBlocks,
} from "@wordpress/block-editor";
import { SelectControl, Panel, PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export type BlockEditProps = CreateBlockEditProps<
	InterpretedAttributes,
	InterpretedUsedContext
>;

export function Edit({ attributes, setAttributes }: BlockEditProps) {
	const { title, align, size } = attributes;
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
					className="title"
					onChange={(newTitle: InterpretedAttributes["title"]) => {
						setAttributes({ title: newTitle });
					}}
					allowedFormats={["core/bold", "core/italic"]}
					value={title}
					placeholder={__("Write your title…")}
				/>
				<InnerBlocks template={[["core/image"]]} templateLock="all" />
			</div>
		</>
	);
}
