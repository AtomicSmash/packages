module.exports = {
	extends: ["@atomicsmash/eslint-config"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
	ignorePatterns: ["./packages/__TEMPLATE__/**/*", "vitest.workspace.ts", "**/vendor/**/*.js"],
};
