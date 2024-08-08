import { InnerBlocks } from "@wordpress/block-editor";

/**
 * For dynamic blocks, you generally want 1 of two save functions,
 * depending if your block has or doesn't have inner blocks.
 * If you need a custom Save function, you can delete these and
 * export it from this file instead.
 */

/**
 * Gets the correct generic save function based on if the block has inner blocks or not.
 * @param hasInnerBlocks Whether the block has innerBlocks or not.
 * @returns The Save react component needed by WP.
 */
export function save({ hasInnerBlocks }: { hasInnerBlocks: boolean }) {
	return hasInnerBlocks ? Save2 : Save1;
}
function Save1() {
	return null;
}
function Save2() {
	return <InnerBlocks.Content />;
}
