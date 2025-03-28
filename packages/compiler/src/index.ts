#!/usr/bin/env node
import type { Configuration } from "webpack";
import {
	sep as pathSeparator,
	extname,
	resolve as resolvePath,
} from "node:path";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import browserslistToEsbuild from "browserslist-to-esbuild";
import CopyPlugin from "copy-webpack-plugin";
import cssNano from "cssnano";
import { EsbuildPlugin } from "esbuild-loader";
import glob from "fast-glob";
import postCSSPresetEnv from "postcss-preset-env";
import SVGSpritemapPlugin from "svg-spritemap-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import webpack from "webpack";
import WebpackAssetsManifest from "webpack-assets-manifest";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace -- Match NodeJS def
	namespace NodeJS {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Match NodeJS def
		interface ProcessEnv {
			NODE_ENV: "production" | "development" | "test" | undefined;
		}
	}
}

const argv = await yargs(hideBin(process.argv))
	.options({
		in: {
			demandOption: true,
			describe:
				"The directory where the source files can be found. Relative to cwd.",
			type: "string",
		},
		out: {
			demandOption: true,
			describe:
				"The directory where the compiled files will out output. Relative to cwd.",
			type: "string",
		},
		watch: {
			boolean: true,
			default: false,
			describe:
				"Whether to watch the files in the source folder for changes and compile.",
		},
		analyse: {
			boolean: true,
			default: false,
			describe: "See a report of the generated bundle once built.",
		},
	})
	.showHelpOnFail(false, "Specify --help for available options")
	.parse();

const MODE =
	process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
		? "development"
		: "production";

const srcFolder = resolvePath(argv.in);
const distFolder = resolvePath(argv.out);
// Add optional support for Tailwind if tailwind postcss plugin is installed
const tailwindPostCSSPlugin = await import("@tailwindcss/postcss")
	.then((tailwindPostCSS) => [tailwindPostCSS.default])
	.catch(
		async () =>
			await import("tailwindcss")
				.then((tailwindcss) => [tailwindcss.default])
				.catch(() => []),
	);
// Add optional support for Vue if vue-loader is installed
const vueConfig = await import("vue-loader")
	.then((vueLoaderModule) => ({
		loader: [
			{
				test: /\.vue$/,
				loader: "vue-loader",
			},
		],
		plugin: [new vueLoaderModule.VueLoaderPlugin()],
	}))
	.catch(() => ({ loader: [], plugin: [] }));

const postCSSConfig = [
	[
		// Support tailwind if package is found
		...tailwindPostCSSPlugin,
		postCSSPresetEnv({
			// Support all CSS that is considered stable.
			stage: 2,
			features: {
				// Polyfill support for custom media queries
				"custom-media-queries": true,
			},
		}),
	],
	...(MODE === "production" ? [cssNano] : []),
];

const compiler = webpack({
	resolveLoader: {
		modules: [
			// Get modules from project node_modules folder
			"node_modules",
			// Get modules from this package's internal node modules folder once installed
			resolvePath(import.meta.dirname, "../", "node_modules"),
		],
	},
	// Add sourcemaps in dev mode
	devtool: MODE === "development" ? "source-map" : false,
	// Set the environment mode from NODE_ENV.
	mode: MODE,
	entry: await glob([
		// Parse all direct children of the JS folder, as long as they are JS & TS files
		`${srcFolder}/js/*.{js,ts,jsx,tsx}`,
		// Parse all direct children of the CSS folder, as long as they are CSS files
		`${srcFolder}/css/*.css`,
		// Parse all nested children of the CSS folder, as long as they are non-partial SCSS files
		`${srcFolder}/css/**/[^_]*.s[ac]ss`,
	]).then((paths) => {
		const entryPoints: Configuration["entry"] = {};
		paths.forEach((path) => {
			const entryName = path.replace(srcFolder, "").replace(extname(path), "");
			entryPoints[entryName] = {
				import: path,
				// Output filenames with content hash for fingerprinting
				filename: `${path.replace(`${srcFolder}${pathSeparator}`, "").replace(extname(path), "")}${
					MODE === "production" ? `.[contenthash]` : ""
				}.js`,
			};
		});
		return entryPoints;
	}),
	output: {
		// Output filenames with content hash for fingerprinting
		filename: "js/[name].[contenthash].js",
		// Clear files between runs
		clean: true,
		library: {
			// Output JS files with Universal Module Definition
			type: "umd",
		},
		// Set the output folder
		path: distFolder,
	},
	resolve: {
		// support TSConfig paths as aliases
		plugins: [new TsconfigPathsPlugin()],
		// resolve TS extensions
		extensions: [".tsx", ".ts", ".js", ".jsx"],
	},
	module: {
		rules: [
			// Support Vue files if vue-loader is present
			...vueConfig.loader,
			// Use ESBuild loader to transpile JS & TS files
			{
				test: /\.[jt]sx?$/,
				use: {
					loader: "esbuild-loader",
					options: {
						// Set target to match the browserslist config
						target: browserslistToEsbuild(),
					},
				},
				// Exclude node_modules files from transpilation unless they are vue files and the vue-loader is present
				exclude: (file) => {
					if (vueConfig.loader.length > 0) {
						return file.includes("node_modules") && !file.includes(".vue.js");
					}
					return file.includes("node_modules");
				},
			},
			// Transpile SCSS files and run the result through postcss
			{
				test: /\.s[ac]ss$/i,
				exclude: /node_modules/,
				type: "asset/resource",
				generator: {
					binary: false,
					filename: "css/[name].[contenthash].css",
				},
				use: [
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								sourceMap: MODE === "development",
								plugins: postCSSConfig,
							},
						},
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: MODE === "development",
						},
					},
				],
			},
			// Run the css files through postcss
			{
				test: /\.css$/i,
				exclude: /node_modules/,
				type: "asset/resource",
				generator: {
					binary: false,
					filename: "css/[name].[contenthash].css",
				},
				use: [
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								sourceMap: MODE === "development",
								plugins: postCSSConfig,
							},
						},
					},
				],
			},
		],
	},
	plugins: [
		// Output progress information when compiling
		new webpack.ProgressPlugin(),
		// Generate a manifest file of assets to make it possible to target fingerprinted files
		new WebpackAssetsManifest({
			writeToDisk: true,
			output: `${distFolder}/assets-manifest.json`,
			customize(entry) {
				if (entry.key === "spritemap.svg") {
					return { key: "icons/sprite.svg", value: entry.value };
				}
				if (entry.key.startsWith("/")) {
					return { key: entry.key.slice(1), value: entry.value };
				}
				if (
					entry.key === "assets.php" ||
					entry.key.startsWith("fonts") ||
					entry.key.startsWith("images")
				) {
					return false;
				}

				return entry;
			},
		}),
		// Create an SVG sprite from a folder of provided icons
		new SVGSpritemapPlugin(`${srcFolder}/icons/*.svg`, {
			output: {
				filename: "icons/sprite.[contenthash].svg",
			},
			sprite: {
				prefix: "",
				generate: {
					title: false,
				},
			},
		}),
		// Copy fonts and images from the src folder to assets (available for backwards compatibility, not recommended)
		new CopyPlugin({
			patterns: [
				{
					from: `${srcFolder}/fonts`,
					to: "[path]fonts/[name][ext]",
					noErrorOnMissing: true,
				},
				{
					from: `${srcFolder}/images`,
					to: "[path]images/[name][ext]",
					noErrorOnMissing: true,
				},
			],
		}),
		// Output a bundle analysis if flag was provided
		...(argv.analyse ? [new BundleAnalyzerPlugin({})] : []),
		// Extract wordpress dependencies from js files and output a wordpress assets file for enqueues
		new DependencyExtractionWebpackPlugin({
			combineAssets: true,
		}),
		// Support Vue files if vue-loader is present
		...vueConfig.plugin,
	],
	optimization: {
		minimizer: [
			// Minify JS files
			new EsbuildPlugin({
				target: browserslistToEsbuild(),
			}),
		],
	},
});

if (argv.watch) {
	const watching = compiler.watch(
		{
			// Example
			aggregateTimeout: 300,
			poll: undefined,
		},
		(error, stats) => {
			if (error) {
				console.error(error.stack ?? error);
				process.exitCode = 1;
				watching.close((closeError) => {
					console.error(closeError);
				});
			} else if (stats) {
				const info = stats.toJson();
				if (stats.hasErrors()) {
					const errors = info.errors!;
					console.warn("The compiler produced the following errors: \n");
					for (const error of errors) {
						console.warn(error.message);
					}
				}
				if (stats.hasWarnings()) {
					const warnings = info.warnings!;
					console.warn("The compiler produced the following warnings: \n");
					for (const warning of warnings) {
						console.warn(warning.message);
					}
				}
			}
		},
	);
	process.on("SIGINT", function () {
		watching.close((closeError) => {
			console.error(closeError);
		});
	});
} else {
	compiler.run((error, stats) => {
		if (error) {
			console.error(error);
			process.exitCode = 1;
		} else if (stats) {
			const info = stats.toJson();
			if (stats.hasErrors()) {
				const errors = info.errors!;
				console.warn("The compiler produced the following errors: \n");
				for (const error of errors) {
					console.warn(error.message);
				}
				process.exitCode = 1;
			}
			if (stats.hasWarnings()) {
				const warnings = info.warnings!;
				console.warn("The compiler produced the following warnings: \n");
				for (const warning of warnings) {
					console.warn(warning.message);
				}
				if (!stats.hasErrors()) {
					process.exitCode = 2;
				}
			}
		}

		compiler.close((closeError) => {
			if (closeError) {
				process.exitCode = 1;
			}
		});
	});
}
