/** @type {import('eslint').Linter.Config} */
module.exports = {
	extends: ["@atomicsmash/eslint-config"],
	parserOptions: {
		sourceType: "module",
	},
	ignorePatterns: ["**/*.d.ts"],
};
