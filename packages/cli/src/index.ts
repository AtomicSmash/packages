import { Options } from "sass";

export type SCSSAliases = {
	loadPaths?: Options<"async">["loadPaths"];
	importers?: Options<"async">["importers"];
};

export type SmashConfig = {
	themeName: string;
	themePath: string;
	assetsOutputFolder?: string;
	npmInstallPaths?: string[];
	composerInstallPaths?: string[];
	scssAliases?: SCSSAliases;
};

export { getSmashConfig } from "./utils.js";
