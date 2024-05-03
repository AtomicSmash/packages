import type { BlockEditProps, InterpretedAttributes } from "./index";
import type { Element } from "@wordpress/element";
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

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export function Edit({ attributes, setAttributes }: BlockEditProps): Element {
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
