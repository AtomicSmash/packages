const commonRules = {
	"custom-property-pattern": null,
	"function-url-quotes": ["always"],
	"rule-empty-line-before": [
		"always",
		{
			except: ["first-nested"],
			ignore: ["after-comment"],
		},
	],
	"comment-empty-line-before": [
		"always",
		{
			except: ["first-nested"],
			ignore: ["stylelint-commands"],
		},
	],
	"order/order": [
		"custom-properties",
		"dollar-variables",
		"declarations",
		"at-rules",
		"rules",
	],
	"selector-class-pattern": [
		"^([a-z][a-z0-9]*)([_-]+[a-z0-9]+)*$",
		{
			message:
				"Selector should use lowercase and separate words with hyphens or underscores (selector-class-pattern)",
		},
	],
	"at-rule-empty-line-before": [
		"always",
		{
			ignore: ["blockless-after-blockless", "first-nested", "after-comment"],
		},
	],
};

/** @type {import('stylelint').Config} */
module.exports = {
	reportDescriptionlessDisables: true,
	reportInvalidScopeDisables: true,
	reportNeedlessDisables: true,
	plugins: ["stylelint-order"],
	rules: commonRules,
	overrides: [
		{
			files: ["*.css", "**/*.css"],
			extends: ["stylelint-config-standard", "@wordpress/stylelint-config"],
			rules: {
				"at-rule-no-unknown": [true, { ignoreAtRules: "context" }],
			},
		},
		{
			files: ["*.scss", "**/*.scss"],
			extends: [
				"stylelint-config-standard-scss",
				"@wordpress/stylelint-config/scss",
			],
			rules: {
				"scss/operator-no-newline-after": null,
				"no-descending-specificity": null,
				"scss/at-rule-no-unknown": [true, { ignoreAtRules: "context" }],
			},
		},
		{
			files: ["**/editor-style?(s).?(s)css"],
			rules: {
				"declaration-property-value-allowed-list": null,
			},
		},
	],
};
