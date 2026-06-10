import type { Options } from "sass";

export type SCSSAliases = {
	loadPaths?: Options<"async">["loadPaths"];
	importers?: Options<"async">["importers"];
};

export type SmashConfigV1 = {
	version?: 1 | undefined;
	projectName: string;
	themePath: string;
	themeFolderName?: string;
	assetsOutputFolder?: string;
	npmInstallPaths?: string[];
	composerInstallPaths?: string[];
	scssAliases?: SCSSAliases;
};

export type SmashConfigV2 = {
	version: 2;
	projectName: string;
	themePath: string;
	themeFolderName?: string;
	assetsOutputFolder?: string;
	npmInstallPaths?: string[];
	composerInstallPaths?: string[];
	scssAliases?: SCSSAliases;
	uploadsPath?: string;
	pullMedia?: {
		monthsToPull?: number;
	};
	staging: {
		url: string;
		webRoot: string;
		dbPrefix?: string;
		uploadsPath?: string;
		ssh: {
			username: string;
			host: string;
			port?: number;
		};
		httpAuth?: {
			username: string;
			password: string;
		};
	};
};

export type SmashConfig = SmashConfigV1 | SmashConfigV2;

export type SmashConfigV1Resolved = {
	version: 1;
	projectName: string;
	themePath: string;
	themeFolderName: string;
	assetsOutputFolder: string;
	npmInstallPaths: string[];
	composerInstallPaths: string[];
	scssAliases: SCSSAliases;
};

export type SmashConfigV2Resolved = {
	version: 2;
	projectName: string;
	themePath: string;
	themeFolderName: string;
	assetsOutputFolder: string;
	npmInstallPaths: string[];
	composerInstallPaths: string[];
	scssAliases: SCSSAliases;
	uploadsPath: string;
	pullMedia: {
		monthsToPull: number;
	};
	staging: {
		url: string;
		webRoot: string;
		dbPrefix: string;
		uploadsPath: string;
		ssh: {
			username: string;
			host: string;
			port?: number;
		};
		httpAuth?: {
			username: string;
			password: string;
		};
	};
};
