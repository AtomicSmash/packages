import type { Configuration, PathData, RuleSetRule } from "webpack";
import {
	sep as pathSeparator,
	extname,
	resolve as resolvePath,
	relative,
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
import { WebpackAssetsManifest } from "webpack-assets-manifest";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { BlocksPlugin } from "./BlocksPlugin.js";
import { getBlocksAssetsEntryPoints } from "./getBlocksAssetsEntryPoints.js";

// ArgumentsCamelCase<Awaited<ReturnType<typeof builder>["argv"]>>
export async function config(options: {
	/**
	 * The directory where the source files can be found. Relative to cwd.
	 */
	in: string;
	/**
	 * The directory where the compiled files will out output. Relative to cwd.
	 */
	out: string;
	/**
	 * Whether to watch the files in the source folder for changes and compile.
	 */
	watch?: boolean | undefined;
	/**
	 * See a report of the generated bundle once built.
	 */
	analyse?: boolean | undefined;
	/**
	 * Enable experimental support for WordPress blocks compilation.
	 */
	experimentalBlocksSupport?: boolean | undefined;
	/**
	 * A comma separated list of the folder names of blocks to exclude from compilation. Requires experimental blocks support.
	 */
	excludeBlocks?: string[] | undefined;
}) {
	const argv = {
		watch: false,
		analyse: false,
		experimentalBlocksSupport: false,
		excludeBlocks: ["__TEMPLATE__"],
		...options,
	};
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
			loader: [{ test: /\.vue$/, loader: "vue-loader" }],
			plugin: [new vueLoaderModule.VueLoaderPlugin()],
			globals: {
				__VUE_OPTIONS_API__: "true",
				__VUE_PROD_DEVTOOLS__: "false",
				__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
			},
			aliases: { vue: "vue/dist/vue.esm-bundler.js" },
		}))
		.catch(() => ({ loader: [], plugin: [], globals: {}, aliases: {} }));

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

	function getEsBuildLoaderSetup(loader: "ts" | "default") {
		return {
			use: {
				loader: "esbuild-loader",
				options: {
					loader: loader,
					// Set target to match the browserslist config
					target: browserslistToEsbuild(),
					tsconfig: process.cwd() + "/tsconfig.json",
				},
			},
			exclude: (file) => {
				// Exclude all block.json.ts files (handled by a separate loader).
				if (argv.experimentalBlocksSupport && file.includes("block.json")) {
					return true;
				}
				// Exclude node_modules files from transpilation unless they are vue files and the vue-loader is present
				if (vueConfig.loader.length > 0) {
					return file.includes("node_modules") && !file.includes(".vue.js");
				}
				return file.includes("node_modules");
			},
		} satisfies RuleSetRule;
	}
	return {
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
		entry: await glob(
			[
				...(argv.experimentalBlocksSupport
					? [`${srcFolder}/blocks/**/block.json.ts`]
					: []),
				// Parse all direct children of the JS folder, as long as they are JS & TS files
				`${srcFolder}/scripts/*.{js,ts,jsx,tsx}`,
				// Parse all direct children of the CSS folder, as long as they are CSS files
				`${srcFolder}/styles/*.css`,
				// Parse all nested children of the CSS folder, as long as they are non-partial SCSS files
				`${srcFolder}/styles/**/[^_]*.s[ac]ss`,
			],
			{
				ignore: argv.experimentalBlocksSupport
					? argv.excludeBlocks.map(
							(blockName) =>
								`${srcFolder}/blocks/**/${blockName}/block.json.ts`,
						)
					: [],
			},
		).then(async (paths) => {
			const { restOfPaths, entryPoints } = argv.experimentalBlocksSupport
				? await getBlocksAssetsEntryPoints(paths, {}, srcFolder)
				: { restOfPaths: paths, entryPoints: {} };

			restOfPaths.forEach((path) => {
				const entryName = path.replace(srcFolder, "");
				entryPoints[entryName] = {
					import: path,
					// Output filenames with content hash for fingerprinting
					filename: `${path.replace(`${srcFolder}${pathSeparator}`, "").replace(extname(path), "").replace("scripts/", "js/")}${
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
			alias: { ...vueConfig.aliases },
			// support TSConfig paths as aliases
			plugins: [
				new TsconfigPathsPlugin({
					configFile: process.cwd() + "/tsconfig.json",
				}),
			],
			// resolve TS extensions
			extensions: [".tsx", ".ts", ".js", ".jsx", ".vue"],
		},
		module: {
			rules: [
				// Support Vue files if vue-loader is present
				...vueConfig.loader,
				// Use ESBuild loader to transpile JS & TS files
				{
					test: /\.[jt]sx?$/,
					resourceQuery: (value) => value.includes("vue"),
					// Vue files require explicitly informing ESBuild of the type of loader to use.
					...getEsBuildLoaderSetup("ts"),
				},
				{
					test: /\.[jt]sx?$/,
					resourceQuery: (value) => !value.includes("vue"),
					...getEsBuildLoaderSetup("default"),
				},
				...(argv.experimentalBlocksSupport
					? [
							{
								test: /block\.json\.ts$/,
								type: "asset/resource",
								generator: {
									filename: (pathData: PathData) =>
										relative(srcFolder, pathData.filename ?? "").slice(0, -3),
								},
								use: {
									loader: resolvePath(import.meta.dirname, "./BlocksLoader.js"),
								},
							},
						]
					: []),
				// Transpile SCSS files and run the result through postcss
				{
					test: /\.s[ac]ss$/i,
					type: "asset/resource",
					generator: {
						binary: false,
						filename: (pathData: PathData) => {
							const fileName = pathData.filename;
							if (!fileName) {
								return;
							}
							const isVendorFile = fileName.includes("node_modules");
							if (isVendorFile) {
								const vendorPathData = fileName.split(pathSeparator);
								const nodeModulesPosition = vendorPathData.findIndex((value) =>
									value.includes("node_modules"),
								);
								const vendorArray = vendorPathData.slice(
									nodeModulesPosition + 1,
									nodeModulesPosition + 3,
								);
								let vendor;
								if (vendorArray[0]?.startsWith("@")) {
									vendor = vendorArray.join(pathSeparator);
								} else {
									vendor = vendorArray[0] ?? "";
								}
								return ["css", "vendor", vendor, vendorPathData.at(-1)]
									.join(pathSeparator)
									.replace(".scss", ".[contenthash].css");
							}
							return relative(srcFolder, pathData.filename ?? "")
								.replace(".scss", ".[contenthash].css")
								.replace("styles/", "css/");
						},
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
							options: { sourceMap: MODE === "development" },
						},
					],
				},
				// Run the css files through postcss
				{
					test: /\.css$/i,
					type: "asset/resource",
					generator: {
						binary: false,
						filename: (pathData: PathData) => {
							const fileName = pathData.filename;
							if (!fileName) {
								return;
							}
							const isVendorFile = fileName.includes("node_modules");
							if (isVendorFile) {
								const vendorPathData = fileName.split(pathSeparator);
								const nodeModulesPosition = vendorPathData.findIndex((value) =>
									value.includes("node_modules"),
								);
								const vendorArray = vendorPathData.slice(
									nodeModulesPosition + 1,
									nodeModulesPosition + 3,
								);
								let vendor;
								if (vendorArray[0]?.startsWith("@")) {
									vendor = vendorArray.join(pathSeparator);
								} else {
									vendor = vendorArray[0] ?? "";
								}
								return ["css", "vendor", vendor, vendorPathData.at(-1)]
									.join(pathSeparator)
									.replace(".css", ".[contenthash].css");
							}
							return relative(srcFolder, pathData.filename ?? "")
								.replace(".css", ".[contenthash].css")
								.replace("styles/", "css/");
						},
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
					if (!entry || !entry.key || typeof entry.key === "number") {
						return entry;
					}
					if (
						entry.key === "assets.php" ||
						entry.key === "wordpress-assets-info.php" ||
						entry.key.endsWith(".map") ||
						entry.key.startsWith("fonts") ||
						entry.key.startsWith("images")
					) {
						return false;
					}
					if (entry.key === "spritemap.svg") {
						return { key: "icons/sprite.svg", value: entry.value as string };
					}
					if (entry.key.startsWith("/")) {
						entry.key = entry.key.slice(1);
					}
					if (entry.key.startsWith("css/")) {
						entry.key = entry.key.replace("css/", "styles/");
					}
					if (entry.key.endsWith(".js.js")) {
						entry.key = entry.key.slice(0, -3);
					}

					return entry;
				},
			}),
			// Create an SVG sprite from a folder of provided icons
			new SVGSpritemapPlugin(`${srcFolder}/icons/*.svg`, {
				output: { filename: "icons/sprite.[contenthash].svg" },
				sprite: { prefix: "", generate: { title: false } },
			}),
			// Copy fonts and images from the src folder to assets (available for backwards compatibility, not recommended)
			new CopyPlugin({
				patterns: [
					{
						from: "**/*",
						context: resolvePath(srcFolder, "fonts"),
						to({ context, absoluteFilename }) {
							return `fonts/${relative(context, absoluteFilename ?? "")}`;
						},
						noErrorOnMissing: true,
					},
					{
						from: "**/*",
						context: resolvePath(srcFolder, "images"),
						to({ context, absoluteFilename }) {
							return `images/${relative(context, absoluteFilename ?? "")}`;
						},
						noErrorOnMissing: true,
					},
				],
			}),
			// Output a bundle analysis if flag was provided
			...(argv.analyse ? [new BundleAnalyzerPlugin({})] : []),
			// Extract wordpress dependencies from js files and output a wordpress assets file for enqueues
			new DependencyExtractionWebpackPlugin({
				combineAssets: true,
				// Blocks plugin converts this to php, but it must be output as json here.
				...(argv.experimentalBlocksSupport
					? {
							outputFormat: "json",
							combinedOutputFile: "wordpress-assets-info.json",
						}
					: {
							outputFormat: "php",
							combinedOutputFile: "wordpress-assets-info.php",
						}),
			}),
			// Support Vue files if vue-loader is present
			...vueConfig.plugin,
			...(argv.experimentalBlocksSupport ? [new BlocksPlugin(srcFolder)] : []),
			new webpack.DefinePlugin({ ...vueConfig.globals }),
		],
		optimization: {
			minimizer: [
				// Minify JS files
				new EsbuildPlugin({ target: browserslistToEsbuild() }),
			],
		},
	} satisfies Configuration;
}
