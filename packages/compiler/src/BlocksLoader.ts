import type { BlockMetaData } from "@atomicsmash/blocks-helpers";
import type { LoaderContext } from "webpack";
import { tsImport } from "tsx/esm/api";

export async function loader(
	this: LoaderContext<Record<string, never>>,
	// inputSourceMap?: Record<string, unknown>,
) {
	const callback = this.async();
	const blockJson = await tsImport(this.resourcePath, {
		parentURL: import.meta.url,
		onImport: (file: string) => {
			this.addDependency(file.slice(7));
		},
	}).then(
		(module: { default: BlockJson; blockJson: BlockJson }) => module.blockJson,
	);

	callback(null, JSON.stringify(blockJson));
}

export default loader;

type BlockJson = BlockMetaData<never, never>;
