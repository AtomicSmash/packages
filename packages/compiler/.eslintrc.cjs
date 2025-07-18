module.exports = {
	extends: ["@atomicsmash/eslint-config"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		sourceType: "module",
		project: ["./tsconfig.json"],
	},
};
