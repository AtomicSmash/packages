/** @type {import('eslint').Linter.Config} */
// const OFF = 0;
// const WARN = 1;
const ERROR = 2;

const config = {
	extends: ["plugin:playwright/recommended"],
	rules: {
		"playwright/expect-expect": [
			ERROR,
			{
				assertFunctionNames: [
					"playAudit", // This is the lighthouse playwright test, which contains threshold assertions.
				],
			},
		],
	},
};
module.exports = config;
