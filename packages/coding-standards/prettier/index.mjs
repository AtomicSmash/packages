export default {
	/* Expected defaults:
	Prettier recommendation
	printWidth: 80,

	Single quotes are more often found in text strings (used for apostrophes) so using double quotes prevents lots of escaping characters.
	singleQuote: false,

	Keep very nested indentation near the left to prevent lots of horizontal scrolling.
	tabWidth: 2,

	Semicolons prevent AST errors and are more explicit where a line ends
	semi: true,
	
	Consistent line endings for MacOS and Windows
	endOfLine: "lf",
	*/

	// Tabs are better for visually impaired coders https://www.reddit.com/r/javascript/comments/c8drjo/nobody_talks_about_the_real_reason_to_use_tabs/
	useTabs: true,

	// Helps clean up git diffs by removing changes of a single comma on a line if adding a new line to the bottom
	trailingComma: "all",

	overrides: [
		{
			// yml files require specific indentation rules
			files: ["*.yml", "*.yaml"],
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
	],
};
