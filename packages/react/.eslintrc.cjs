module.exports = {
	extends: [
		"@atomicsmash/eslint-config",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
	],
	plugins: ["react", "react-hooks", "jsx-a11y"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
	overrides: [
		{
			files: ["**/?(*.)+(spec|test).[jt]s?(x)"],
			extends: ["plugin:testing-library/react", "plugin:jest-dom/recommended"],
		},
	],
};
