<?php
/**
 * PHP related to this block.
 */

namespace CloudCall\Blocks\Custom\TEMPLATE;

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function register_block() {
	\register_block_type( __DIR__ . '/block.json' );
}
\add_action( 'init', __NAMESPACE__ . '\\register_block' );
