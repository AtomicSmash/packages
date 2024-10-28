/** @type {import('eslint').Linter.Config} */
const OFF = 0;
const WARN = 1;
const ERROR = 2;

const config = {
	ignorePatterns: [".eslintrc.cjs", "dist/**/*", "**/*.config.*"],
	plugins: ["import"],
	extends: [
		"eslint:recommended",
		"plugin:eslint-comments/recommended",
		"prettier",
	],
	env: {
		browser: true,
		commonjs: true,
		node: true,
		es2022: true,
	},
	rules: {
		"no-case-declarations": [OFF],
		"import/order": [
			ERROR,
			{
				alphabetize: {
					order: "asc",
				},
				groups: [
					"type",
					"builtin",
					"external",
					"internal",
					"parent",
					["sibling", "index"],
				],
				"newlines-between": "ignore",
				pathGroups: [],
				pathGroupsExcludedImportTypes: [],
			},
		],
		"prefer-const": [ERROR],
		"no-var": [ERROR],
		"import/no-duplicates": WARN,
		"eslint-comments/no-unused-disable": [ERROR],
		"eslint-comments/require-description": [
			ERROR,
			{ ignore: ["eslint-enable"] },
		],
	},
	overrides: [
		{
			files: ["*.ts", "*.tsx", "*.mts", "*.cts"],
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint", "import"],
			extends: [
				"eslint:recommended",
				"plugin:@typescript-eslint/recommended-type-checked",
				"plugin:@typescript-eslint/stylistic-type-checked",
				"plugin:import/typescript",
				"prettier",
			],
			rules: {
				"@typescript-eslint/naming-convention": [
					ERROR,
					{
						selector: "variableLike",
						format: ["camelCase", "PascalCase", "UPPER_CASE"],
						leadingUnderscore: "allow",
					},
					{ selector: "function", format: ["camelCase", "PascalCase"] },
					{ selector: "typeLike", format: ["PascalCase"] },
					{
						selector: "variable",
						types: ["boolean"],
						format: ["PascalCase"],
						prefix: ["is", "should", "has", "can", "did", "will"],
						leadingUnderscore: "allow",
					},
				],
				"@typescript-eslint/consistent-type-definitions": [ERROR, "type"],
				"@typescript-eslint/non-nullable-type-assertion-style": OFF,
				"@typescript-eslint/no-unused-vars": [
					ERROR,
					{
						args: "all",
						argsIgnorePattern: "^_",
						caughtErrors: "all",
						caughtErrorsIgnorePattern: "^_",
						destructuredArrayIgnorePattern: "^_",
						varsIgnorePattern: "^_",
						ignoreRestSiblings: true,
					},
				],
			},
		},
		{
			files: ["**/*.test.*"],
			rules: {
				"@typescript-eslint/no-unused-vars": [OFF],
			},
		},
	],
};
module.exports = config;
