/** @type {import('eslint').Linter.Config} */
module.exports = {
	extends: ["../.eslintrc.cjs"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: "./tsconfig.json",
		sourceType: "module",
	},
};
