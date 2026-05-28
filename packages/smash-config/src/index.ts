import type { Options } from "sass";

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
	staging: {
		url: string,
		ssh: {
			username: string,
			host: string,
			port: string,
		}
		httpAuth: {
			username: string,
			password: string
		}
	}
};

export { getSmashConfig } from "./utils.js";
