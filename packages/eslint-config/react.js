/** @type {import('eslint').Linter.Config} */
// const OFF = 0;
const WARN = 1;
// const ERROR = 2;

const config = {
	extends: [
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
	],
	rules: {
		"react-hooks/exhaustive-deps": [
			WARN,
			{
				additionalHooks: "(useSelect|useSuspenseSelect)",
			},
		],
	},
};
module.exports = config;
