import { Options } from "sass";

export type SCSSAliases = {
	loadPaths?: Options<"async">["loadPaths"];
	importers?: Options<"async">["importers"];
};

export type SmashConfig = {
	projectName: string;
	themePath: string;
	themeFolderName?: string;
	assetsOutputFolder?: string;
	npmInstallPaths?: string[];
	composerInstallPaths?: string[];
	scssAliases?: SCSSAliases;
};

export { getSmashConfig } from "./utils.js";
