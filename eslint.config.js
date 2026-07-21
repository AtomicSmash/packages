import { defineConfig, globalIgnores } from "@eslint/config-helpers";
import { recommendedConfig as recommendedAtomicSmashConfig } from "./packages/coding-standards/dist/eslint/index.js";

export default defineConfig([
	globalIgnores([
		"./packages/__TEMPLATE__/**/*",
		"**/dist/**/*",
		"**/*.d.ts",
		"./packages/init-testing/toCopy/**/*",
	]),
	{
		files: [
			"**/*.js",
			"**/*.cjs",
			"**/*.mjs",
			"**/*.ts",
			"**/*.cts",
			"**/*.mts",
		],
		extends: [recommendedAtomicSmashConfig],
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["vitest.config.ts"],
				},
			},
		},
	},
	{
		files: ["./packages/blocks-helpers/**/*.test.ts"],
		extends: [],
		rules: {
			"@typescript-eslint/no-unused-vars": ["off"],
		},
	},
	{
		files: ["./packages/cli/**/*"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: `${import.meta.dirname}/packages/cli`,
			},
		},
	},
	{
		files: ["./packages/coding-standards/**/*"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: `${import.meta.dirname}/packages/coding-standards`,
			},
		},
	},
	{
		files: ["./packages/compiler/**/*"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: `${import.meta.dirname}/packages/compiler`,
			},
		},
	},
	{
		files: ["./packages/date-php/**/*"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: `${import.meta.dirname}/packages/date-php`,
			},
		},
	},
	{
		files: ["./packages/init-testing/**/*"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: `${import.meta.dirname}/packages/init-testing`,
			},
		},
	},
	{
		files: ["./packages/smash-config/**/*"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: `${import.meta.dirname}/packages/smash-config`,
			},
		},
	},
	{
		files: ["./packages/test-utils/**/*"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: `${import.meta.dirname}/packages/test-utils`,
			},
		},
	},
	{
		files: ["./packages/wordpress-tests-helper/**/*"],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: `${import.meta.dirname}/packages/wordpress-tests-helper`,
			},
		},
	},
]);
