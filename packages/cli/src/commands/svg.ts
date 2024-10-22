import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve as resolvePath, join as joinPath, dirname } from "path";
import glob from "glob-promise";
import SVGSpriter from "svg-sprite";
import File from "vinyl";
import { hasHelpFlag, interpretFlag } from "../utils.js";

export const svgHelpMessage = `
  Atomic Smash CLI - SVG command.

  Generate an SVG sprite from a group of SVGs.

  Options:
    --in         The directory where the SVGs can be found.
    --out        The directory where the SVG sprite will be output.

  Example usage:
    $ smash-cli svg --in icons --out public/assets
`;

export default function svg(args: string[]) {
	if (hasHelpFlag(args)) {
		console.log(svgHelpMessage);
		return;
	}
	const inFlag = interpretFlag(args, "--in");
	if (!inFlag.isPresent || inFlag.value === null) {
		throw new Error("You need to provide a value for the --in flag.");
	}
	const outFlag = interpretFlag(args, "--out");
	if (!outFlag.isPresent || outFlag.value === null) {
		throw new Error("You need to provide a value for the --out flag.");
	}

	const config = {
		dest: outFlag.value,
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

	const cwd = resolvePath(inFlag.value);
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
					console.log(
						`SVG sprite was successfully generated in ${outFlag.value}.`,
					);
				});
		})
		.catch((error: unknown) => {
			console.error({ error });
			throw error;
		});
}
