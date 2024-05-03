import type { BlockSaveProps } from "./index";
import type { Element } from "@wordpress/element";
import { useBlockProps, RichText } from "@wordpress/block-editor";

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
