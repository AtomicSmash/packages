declare module "@wordpress/scripts/config/webpack.config.js";
declare module "@wordpress/scripts/utils/index.js" {
	function getBlockJsonScriptFields(
		blockJson: Record<string, unknown>,
	): null | Record<string, unknown>;
}
