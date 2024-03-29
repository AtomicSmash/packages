import type { BlockSaveProps } from "@atomicsmash/blocks-helpers";
import type { Element } from "@wordpress/element";
import { useBlockProps, RichText } from "@wordpress/block-editor";
import { InterpretedAttributes } from "./index";

export function Save({
	attributes,
}: BlockSaveProps<InterpretedAttributes>): Element {
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
