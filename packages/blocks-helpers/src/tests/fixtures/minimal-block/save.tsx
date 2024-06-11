import type { InterpretedAttributes } from "./attributes";
import type { CreateBlockSaveProps } from "@atomicsmash/blocks-helpers";
import { useBlockProps, RichText, InnerBlocks } from "@wordpress/block-editor";

type BlockSaveProps = CreateBlockSaveProps<InterpretedAttributes>;

export function Save({ attributes }: BlockSaveProps) {
	const { title, align, size } = attributes;
	const blockProps = useBlockProps.save({
		className: `align-${align} blockSize-${size}`,
	});
	return (
		<div {...blockProps}>
			<RichText.Content tagName="h2" value={title} className="title" />
			<InnerBlocks.Content />
		</div>
	);
}
