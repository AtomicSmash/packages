const OFF = 0;
const WARN = 1;
const ERROR = 2;

import js from "@eslint/js";
import esLintComments from "@eslint-community/eslint-plugin-eslint-comments";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

const config = defineConfig([
	js.configs.recommended,
	esLintComments.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	importPlugin.flatConfigs.typescript,
	{
		ignorePatterns: [".eslintrc.cjs", "dist/**/*", "**/*.config.*"],
		plugins: {
			"@typescript-eslint": tseslint.plugin,
			import: importPlugin,
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node,
			},
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
			},
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
					prefix: ["is", "should", "has", "can", "did", "will", "are"],
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
		files: ["*.cjs"],
		languageOptions: {
			sourceType: "commonjs",
		},
	},
	{
		files: ["*.mjs"],
		languageOptions: {
			sourceType: "module",
		},
	},
	{
		files: ["**/*.test.*"],
		rules: {
			"@typescript-eslint/no-unused-vars": [OFF],
		},
	},
	eslintConfigPrettier,
]);
export default config;
