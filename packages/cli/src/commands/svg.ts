import type { YargsInstance } from "../cli.js";
import type { ArgumentsCamelCase } from "yargs";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve as resolvePath, join as joinPath, dirname } from "path";
import glob from "glob-promise";
import SVGSpriter from "svg-sprite";
import File from "vinyl";

export const command = "svg";
export const describe = "Generate an SVG sprite from a group of SVGs.";
export const builder = function (yargs: YargsInstance) {
	return yargs
		.options({
			in: {
				demandOption: true,
				string: true,
				normalize: true,
				description: "The directory where the SVGs can be found.",
			},
			out: {
				demandOption: true,
				string: true,
				normalize: true,
				description: "The directory where the SVG sprite will be output.",
			},
		})
		.example("$0 svg --in icons --out public/assets", "");
};

export function handler(
	args: ArgumentsCamelCase<Awaited<ReturnType<typeof builder>["argv"]>>,
) {
	const config = {
		dest: args.out,
		shape: {
			dimension: {
				attributes: false,
			},
			transform: [
				{
					svgo: {},
				},
			],
		},
		mode: {
			symbol: {
				dest: "",
				sprite: "sprite.svg",
			},
		},
	};
	const spriter = new SVGSpriter(config);

	const cwd = resolvePath(args.in);
	// Find SVG files recursively via `glob`
	glob("**/*.svg", { cwd })
		.then(async (files) => {
			await new Promise<void>((resolve) => {
				files.forEach((file) => {
					// Create and add a vinyl file instance for each SVG
					spriter.add(
						new File({
							path: joinPath(cwd, file), // Absolute path to the SVG file
							base: cwd, // Base path (see `name` argument)
							contents: readFileSync(joinPath(cwd, file)), // SVG file contents
						}),
					);
				});
				resolve();
			})
				.then(async () => {
					await spriter
						.compileAsync()
						.then(
							(compiledResponse: {
								result: { symbol: Record<string, File> };
							}) => {
								const { result } = compiledResponse;
								for (const type of Object.values(result.symbol)) {
									if (type.contents) {
										mkdirSync(dirname(type.path), { recursive: true });
										// TODO: find out how to remove this error.
										// eslint-disable-next-line @typescript-eslint/no-base-to-string -- This works despite this error.
										writeFileSync(type.path, type.contents.toString());
									}
								}
							},
						);
				})
				.then(() => {
					console.log(`SVG sprite was successfully generated in ${args.out}.`);
				});
		})
		.catch((error: unknown) => {
			console.error({ error });
			throw error;
		});
}
