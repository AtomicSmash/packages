#!/usr/bin/env node
import type { Configuration } from "webpack";
import {
	sep as pathSeparator,
	extname,
	resolve as resolvePath,
} from "node:path";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import glob from "fast-glob";
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
// @ts-expect-error -- Module doesn't need to be installed in compiler package.
const tailwindPostCSSPlugin = await import("@tailwindcss/postcss")
	.then(() => ["@tailwindcss/postcss"])
	.catch(
		async () =>
			// @ts-expect-error -- Module doesn't need to be installed in compiler package.
			await import("tailwindcss").then(() => ["tailwindcss"]).catch(() => []),
	);

const postCSSConfig = [
	[
		...tailwindPostCSSPlugin,
		"postcss-preset-env",
		{
			stage: 2,
			features: {
				"custom-media-queries": true,
			},
		},
	],
	...(MODE === "production" ? ["cssnano"] : []),
];

const compiler = webpack({
	devtool: MODE === "development" ? "source-map" : false,
	mode: MODE,
	experiments: {
		outputModule: true,
	},
	entry: await glob([
		`${srcFolder}/js/*.{js,ts}`,
		`${srcFolder}/css/*.css`,
		`${srcFolder}/css/*.s[ac]ss`,
	]).then((paths) => {
		const entryPoints: Configuration["entry"] = {};
		paths.forEach((path) => {
			const entryName = path.replace(srcFolder, "").replace(extname(path), "");

			entryPoints[entryName] = {
				import: path,
				filename: `${path.replace(`${srcFolder}${pathSeparator}`, "").replace(extname(path), "")}${
					MODE === "production" ? `.[contenthash]` : ""
				}.js`,
			};
		});
		return entryPoints;
	}),
	output: {
		filename: "js/[name].[contenthash].js",
		clean: true,
		library: {
			type: "modern-module",
		},
		module: true,
		path: distFolder,
	},
	resolve: {
		plugins: [new TsconfigPathsPlugin()],
		extensions: [".tsx", ".ts", ".js", ".jsx"],
	},
	module: {
		rules: [
			{
				test: /\.[jt]sx?$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [["@babel/preset-typescript"], ["@babel/preset-env"]],
					},
				},
				exclude: /node_modules/,
			},
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
		new webpack.ProgressPlugin(),
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
		...(argv.analyse ? [new BundleAnalyzerPlugin({})] : []),
		new DependencyExtractionWebpackPlugin({
			combineAssets: true,
		}),
	],
	optimization: {
		splitChunks: {
			chunks: "all",
		},
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
					console.error(info.errors);
				}
				if (stats.hasWarnings()) {
					console.warn(info.warnings);
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
				console.error(info.errors);
				process.exitCode = 1;
			}
			if (stats.hasWarnings()) {
				console.warn(info.warnings);
				process.exitCode = 2;
			}
		}

		compiler.close((closeError) => {
			if (closeError) {
				process.exitCode = 1;
			}
		});
	});
}
