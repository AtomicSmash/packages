export const blockJson = {
	apiVersion: 3,
	name: "namespace/block-name",
	version: "",
	title: "Block title",
	category: [],
	description: "",
	textdomain: "",
	keywords: [],
	editorScript: "file:./index.ts",
	viewScript: "file:./view.ts",
	style: "file:./style.scss",
	editorStyle: "file:./editor-style.scss",
	render: "file:./render.php",
} satisfies BlockMetaData;
export default blockJson;

/**
 * The WPDefinedPath type is a subtype of string, where the value represents a path to a JavaScript,
 * CSS or PHP file relative to where block.json file is located. The path provided must be prefixed
 * with file:. This approach is based on how npm handles local paths for packages.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#wpdefinedpath}
 */
export type WPDefinedPath = `file:${string}`;

/**
 * This asset can be a local file path relative to the block.json file (must be prefixed with `file:`) or
 * it can be a style or script handle from a registered asset.
 *
 * @see {@link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#wpdefinedasset}
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- WPDefinedPath is defined by WordPress and may be extended in the future.
export type WPDefinedAsset = WPDefinedPath | string;

export type BlockCategory =
	| "text"
	| "media"
	| "design"
	| "widgets"
	| "theme"
	| "embed"
	// Allow other strings, but keep autocomplete of base values.
	| (string & NonNullable<unknown>);

type BlockMetaData = {
	/**
	 * The version of the Block API used by the block. The most recent version is 2 and it was introduced in WordPress 5.6.
	 *
	 * See the API versions documentation at https://developer.wordpress.org/block-editor/reference-guides/block-api/block-api-versions/ for more details.
	 */
	apiVersion?: 1 | 2 | 3;

	/**
	 * The name for a block is a unique string that identifies a block.
	 * Names have to be structured as `namespace/block-name`, where namespace is the name of your plugin or theme.
	 * Regex: ^[a-z][a-z0-9-]\*\/[a-z][a-z0-9-]\*$
	 */
	name: string;

	/**
	 * This is the display title for your block, which can be translated with our translation functions. The block inserter will show this name.
	 */
	title: string;

	/**
	 * Blocks are grouped into categories to help users browse and discover them.
	 * Core provided categories are: text, media, design, widgets, theme, embed
	 *
	 * Plugins and Themes can also register custom block categories.
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/#managing-block-categories
	 */
	category?: BlockCategory[];

	/**
	 * Setting parent lets a block require that it is only available when nested within the specified blocks.
	 * For example, you might want to allow an ‘Add to Cart’ block to only be available within a ‘Product’ block.
	 */
	parent?: string[];

	/**
	 * The `ancestor` property makes a block available inside the specified block types at any position of the ancestor block subtree.
	 * That allows, for example, to place a ‘Comment Content’ block inside a ‘Column’ block, as long as ‘Column’ is somewhere within a ‘Comment Template’ block.
	 */
	ancestor?: string[];

	/**
	 * The `allowedBlocks` property specifies that only the listed block types can be the children of this block.
	 * For example, a ‘List’ block allows only ‘List Item’ blocks as direct children.
	 */
	allowedBlocks?: string[];

	/**
	 * This is a short description for your block, which can be translated with our translation functions. This will be shown in the block inspector.
	 */
	description?: string;

	/**
	 * Sometimes a block could have aliases that help users discover it while searching.
	 * For example, an image block could also want to be discovered by photo. You can do so by providing an array of unlimited terms (which are translated).
	 */
	keywords?: string[];

	/**
	 * The current version number of the block, such as 1.0 or 1.0.3. It’s similar to how plugins are versioned.
	 * This field might be used with block assets to control cache invalidation, and when the block author omits it,
	 * then the installed version of WordPress is used instead.
	 */
	version?: string;

	/**
	 * The gettext text domain of the plugin/block. More information can be found in the Text Domain section of the How to Internationalize your Plugin page.
	 *
	 * @see https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/
	 */
	textdomain?: string;

	/**
	 * Block styles can be used to provide alternative styles to block. It works by adding a class name to the block’s wrapper.
	 * Using CSS, a theme developer can target the class name for the block style if it is selected.
	 *
	 * Plugins and Themes can also register custom block style for existing blocks.
	 *
	 * @see https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/#block-styles
	 */
	styles?: {
		name: string;
		label: string;
		isDefault?: boolean;
	}[];

	/**
	 * Block type editor script definition. It will only be enqueued in the context of the editor.
	 */
	editorScript?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend and editor script definition. It will be enqueued both in the editor and when viewing the content on the front of the site.
	 */
	script?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend script definition. It will be enqueued only when viewing the content on the front of the site.
	 */
	viewScript?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type editor style definition. It will only be enqueued in the context of the editor.
	 */
	editorStyle?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Block type frontend style definition. It will be enqueued both in the editor and when viewing the content on the front of the site.
	 */
	style?: WPDefinedAsset | WPDefinedAsset[];

	/**
	 * Template file loaded on the server when rendering a block.
	 */
	render?: WPDefinedPath;
};
