import { Options } from "sass";

export type SCSSAliases = {
	loadPaths?: Options<"async">["loadPaths"];
	importers?: Options<"async">["importers"];
};

type LintingBaselineSingleTool = {
	errors: number;
	fixableErrors: number;
	warnings: number;
	fixableWarnings: number;
};

export type SmashConfig = {
	projectName: string;
	themePath: string;
	themeFolderName?: string;
	assetsOutputFolder?: string;
	npmInstallPaths?: string[];
	composerInstallPaths?: string[];
	scssAliases?: SCSSAliases;
	lintingBaseline?: {
		eslint?: LintingBaselineSingleTool;
		typescript?: LintingBaselineSingleTool;
		stylelint?: LintingBaselineSingleTool;
		phpcs?: LintingBaselineSingleTool;
	};
};

export { getSmashConfig } from "./utils.js";
