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

const baseConfig = defineConfig({
	name: "@atomicsmash/coding-standards/base-config",
	files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
	extends: [
		js.configs.recommended,
		esLintComments.recommended,
		importPlugin.flatConfigs.recommended,
	],
	languageOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
		globals: {
			...globals.browser,
			...globals.node,
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
	},
	settings: {
		"import/resolver": {
			node: true,
		},
	},
});

const typescriptConfig = defineConfig([
	{
		name: "@atomicsmash/coding-standards/typescript-config",
		files: ["**/*.ts", "**/*.cts", "**/*.mts"],
		extends: [
			baseConfig,
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
			importPlugin.flatConfigs.typescript,
		],
		plugins: {
			"@typescript-eslint": tseslint.plugin,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
			},
		},
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
]);

const sharedReactRulesAndSettings = {
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
};

const reactConfig = defineConfig([
	{
		name: "@atomicsmash/coding-standards/react-config",
		files: ["**/*.jsx"],
		extends: [baseConfig, ...sharedReactRulesAndSettings.extends],
		settings: {
			...sharedReactRulesAndSettings.settings,
		},
		rules: {
			...sharedReactRulesAndSettings.rules,
		},
	},
]);

const reactTypescriptConfig = defineConfig([
	{
		name: "@atomicsmash/coding-standards/react-typescript-config",
		files: ["**/*.tsx"],
		extends: [typescriptConfig, ...sharedReactRulesAndSettings.extends],
		settings: {
			...sharedReactRulesAndSettings.settings,
		},
		rules: {
			...sharedReactRulesAndSettings.rules,
		},
	},
]);

export const playwrightConfig = defineConfig([
	{
		name: "@atomicsmash/coding-standards/playwright-config",
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

export const recommendedConfig = defineConfig([
	baseConfig,
	typescriptConfig,
	reactConfig,
	reactTypescriptConfig,
]);
