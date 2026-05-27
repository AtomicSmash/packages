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
	staging: {
		ssh: {
			username: string,
			host: string,
			port: string,
			url: string,
		}
		httpAuth: {
			username: string,
			password: string
		}
	}
};

export { getSmashConfig } from "./utils.js";
