const OFF = 0;
const WARN = 1;
const ERROR = 2;

import js from "@eslint/js";
import esLintComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import { default as playwrightPlugin } from "eslint-plugin-playwright";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export const config = defineConfig([
	{
		files: [
			"**/*.js",
			"**/*.cjs",
			"**/*.mjs",
			"**/*.ts",
			"**/*.cts",
			"**/*.mts",
		],
		extends: [
			js.configs.recommended,
			esLintComments.recommended,
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
			importPlugin.flatConfigs.recommended,
			importPlugin.flatConfigs.typescript,
		],
		plugins: {
			"@typescript-eslint": tseslint.plugin,
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
			"@eslint-community/eslint-comments/no-unused-disable": [ERROR],
			"@eslint-community/eslint-comments/require-description": [
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
		settings: {
			"import/resolver": {
				typescript: true,
				node: true,
			},
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
	{
		files: ["**/*.jsx", "**/*.tsx"],
		extends: [
			reactPlugin.configs.flat.recommended,
			reactPlugin.configs.flat["jsx-runtime"],
			reactHooksPlugin.configs.flat.recommended,
		],
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			"react-hooks/exhaustive-deps": [
				WARN,
				{
					additionalHooks: "(useSelect|useSuspenseSelect)",
				},
			],
		},
	},
]);

export const playwrightConfig = defineConfig([
	{
		extends: [playwrightPlugin.configs["flat/recommended"]],
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
	},
]);
