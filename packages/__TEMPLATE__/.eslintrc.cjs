module.exports = {
	extends: ["@mikeybinns/eslint-config"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
};
