import type { PackageJson } from "type-fest";
import { exec } from "node:child_process";

import {
	gtr as greaterThanRange,
	ltr as lessThanRange,
	validRange,
} from "semver";

type PackageLockJson = {
	name: string;
	lockfileVersion: 3;
	requires: boolean;
	packages: Record<
		`node_modules/${string}`,
		{
			version: string;
		} & Record<string, unknown>
	>;
};

export class PackageManager {
	private packageJson: PackageJson;
	private packageLockJson: PackageLockJson;
	commands = {
		/**
		 * Basic commands, each entry must be its own command.
		 */
		basic: [] as string[],
		/**
		 * Packages to install as normal dependencies with their version constraints.
		 */
		install: [] as string[],
		/**
		 * Packages to install as dev dependencies with their version constraints.
		 */
		devInstall: [] as string[],
	};

	constructor(packageJson: unknown, packageLockJson: unknown) {
		this.packageJson = packageJson as PackageJson;
		this.packageLockJson = packageLockJson as PackageLockJson;
	}

	/**
	 * Run all the queued commands and then clear the commands object.
	 */
	runCommands() {
		if (this.commands.basic.length > 0) {
			for (const basicCommand of this.commands.basic) {
				exec(basicCommand);
			}
		}

		if (this.commands.install.length > 0) {
			const installCommand = `npm install --save ${this.commands.install.join(
				" ",
			)}`;
			exec(installCommand);
		}

		if (this.commands.devInstall.length > 0) {
			const devInstallCommand = `npm install --save-dev ${this.commands.devInstall.join(
				" ",
			)}`;
			exec(devInstallCommand);
		}
		this.commands = {
			basic: [],
			install: [],
			devInstall: [],
		};
	}

	/**
	 * Get information about the package if it's installed.
	 * @param packageName The package name of the package to get info for.
	 * @returns Various information about the package if installed, null if not installed.
	 */
	getDependencyInfo(packageName: string) {
		if (
			this.packageJson.dependencies &&
			packageName in this.packageJson.dependencies
		) {
			return {
				type: "normal" as const,
				packageConstraint: this.packageJson.dependencies[packageName] ?? "",
				currentVersion:
					this.packageLockJson.packages[`node_modules/${packageName}`]
						?.version ?? "",
			};
		}
		if (
			this.packageJson.devDependencies &&
			packageName in this.packageJson.devDependencies
		) {
			return {
				type: "dev" as const,
				packageConstraint: this.packageJson.devDependencies[packageName] ?? "",
				currentVersion:
					this.packageLockJson.packages[`node_modules/${packageName}`]
						?.version ?? "",
			};
		}
		return null;
	}
	/**
	 * This method will check if a dependency is installed, and if it isn't, it will add a command to the commands property.
	 * @param packageName The package name of the package to check.
	 * @param options (Optional) Options for installing the package.
	 * @param options.packageConstraint (Optional) What version of the package to install. Defaults to `"*"`.
	 * @param options.type (Optional) What type of dependency to install it as. Accepts `"normal"` or `"dev"`. Defaults to `"normal"`.
	 * @returns Whether a command was added to the commands prompt.
	 * @throws If the package cannot be installed.
	 */
	async ensurePackageIsInstalled(
		packageName: string,
		options?: {
			packageConstraint?: string;
			type?: "normal" | "dev";
		},
	) {
		return new Promise<boolean>((resolve, reject) => {
			const { packageConstraint, type } = {
				type: "normal",
				packageConstraint: "*",
				...options,
			};
			const packageConstraintRange = validRange(packageConstraint);
			if (packageConstraintRange === null) {
				throw new Error(
					"The packageConstraint value you entered is not a valid semver range.",
				);
			}
			const dependencyInfo = this.getDependencyInfo(packageName);
			if (type === "dev") {
				if (dependencyInfo === null) {
					console.log(
						`${packageName} is missing, we will automatically install it for you.`,
					);
					this.commands.devInstall.push(
						`${packageName}@"${packageConstraintRange}"`,
					);
					return resolve(true);
				}
				if (
					greaterThanRange(
						dependencyInfo.currentVersion,
						packageConstraintRange,
					)
				) {
					console.log(
						`The package ${packageName} is already installed and is newer than the requested version. You may encounter issues with your testing setup.`,
					);
					return reject("NEWER_PACKAGE_FOUND");
				}
				if (
					lessThanRange(dependencyInfo.currentVersion, packageConstraintRange)
				) {
					console.log(
						`The package ${packageName} is already installed and is older than the requested version. You should manually update the package to match the range: ${packageConstraintRange}.`,
					);
					return reject("OLDER_PACKAGE_FOUND");
				}
				console.log(
					`An acceptable version of ${packageName} is already installed, skipping...`,
				);
				return resolve(false);
			}
			if (dependencyInfo === null) {
				console.log(
					`${packageName} is missing, we will automatically install it for you.`,
				);
				this.commands.install.push(
					`${packageName}@"${packageConstraintRange}"`,
				);
				return resolve(true);
			}
			const isFoundAsDevDependency = dependencyInfo.type === "dev";
			if (
				greaterThanRange(dependencyInfo.currentVersion, packageConstraintRange)
			) {
				console.log(
					`The package ${packageName} is already installed and is newer than the requested version. You may encounter issues with your testing setup.${
						isFoundAsDevDependency
							? ` You should also move this dependency to be a normal dependency.`
							: ""
					}`,
				);
				return reject("NEWER_PACKAGE_FOUND");
			}
			if (
				lessThanRange(dependencyInfo.currentVersion, packageConstraintRange)
			) {
				console.log(
					`The package ${packageName} is already installed and is older than the requested version. You should manually update the package to match the range: ${packageConstraintRange}.${
						isFoundAsDevDependency
							? ` You should also move this dependency to be a normal dependency.`
							: ""
					}`,
				);
				return reject("OLDER_PACKAGE_FOUND");
			}
			if (isFoundAsDevDependency) {
				console.log(
					`An acceptable version of ${packageName} is already installed, updating it to a normal dependency...`,
				);
				this.commands.install.push(
					`${packageName}@"${packageConstraintRange}"`,
				);
				return resolve(true);
			}
			console.log(
				`An acceptable version of ${packageName} is already installed, skipping...`,
			);
			return resolve(false);
		});
	}
}
