import type { InterpretedAttributes } from "./attributes";
import type { CreateBlockEditProps } from "@atomicsmash/blocks-helpers";
import { useBlockProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";

export type BlockEditProps = CreateBlockEditProps<
	InterpretedAttributes
>;

export function Edit({ attributes, setAttributes }: BlockEditProps) {
	const blockProps = useBlockProps({
		className: "template-block",
	});
	const { someAttribute } = attributes;
	setAttributes({ someAttribute: "Template block" });
	return (
		<>
			<div {...blockProps}>{someAttribute}</div>
		</>
	);
}
Edit.displayName = "TemplateEdit";
