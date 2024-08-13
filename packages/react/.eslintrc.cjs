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
	settings: {
		react: {
			version: "detect",
		},
	},
	rules: {
		// Disabling prop-types rule due to false positives
		// See https://github.com/jsx-eslint/eslint-plugin-react/issues/3796
		"react/prop-types": [0],
	},
	overrides: [
		{
			files: ["**/?(*.)+(spec|test).[jt]s?(x)"],
			extends: ["plugin:testing-library/react", "plugin:jest-dom/recommended"],
		},
	],
};
