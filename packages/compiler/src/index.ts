import type { Options } from "sass";
// export { config } from "./config";
// export { config as default } from "./config";

export type SCSSAliases = {
	loadPaths?: Options<"async">["loadPaths"];
	importers?: Options<"async">["importers"];
};
