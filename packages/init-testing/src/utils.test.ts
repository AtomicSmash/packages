import type { ExecException } from "node:child_process";
import { exec } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { sep as pathSeparator } from "node:path";
import { rimraf } from "rimraf";
import { expect, test, describe, vi, afterEach, it, beforeAll } from "vitest";
import { PackageManager } from "./utils.js";

async function execute(
	command: string,
	options: { debug: boolean } = { debug: false },
) {
	return new Promise<{
		error: ExecException | null;
		stdout: string;
		stderr: string;
	}>((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				if (options.debug) {
					console.error({ error, stdout, stderr });
				}
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
				reject({ error, stdout, stderr });
			}
			resolve({ error, stdout, stderr });
		});
	});
}

describe.sequential("Init testing utils", () => {
	const consoleSpy = vi.spyOn(console, "log");
	let packageManager: PackageManager;

	beforeAll(async () => {
		await mkdir(`${import.meta.dirname}/tests`, { recursive: true });
		await writeFile(
			`${import.meta.dirname}/tests/package.json`,
			JSON.stringify({
				dependencies: {
					"@atomicsmash/coding-standards": "^10.0.0",
				},
				devDependencies: {
					"@atomicsmash/eslint-config": "^10.0.0",
				},
			}),
			{ flag: "w+" },
		);
		await execute(
			`cd ${import.meta.dirname}${pathSeparator}tests; npm install --package-lock-only=true`,
		);

		packageManager = new PackageManager(
			await import(`${import.meta.dirname}/tests/package.json`),
			await import(`${import.meta.dirname}/tests/package-lock.json`),
		);
		return async () => {
			await rimraf([
				`${import.meta.dirname}/tests/package.json`,
				`${import.meta.dirname}/tests/package-lock.json`,
			]);
		};
	});
	afterEach(() => {
		consoleSpy.mockReset();
	});
	test("getDependencyInfo()", () => {
		expect(
			packageManager.getDependencyInfo("@atomicsmash/coding-standards"),
		).toEqual({
			type: "normal",
			packageConstraint: "^10.0.0",
			currentVersion: "10.0.1",
		});
		expect(
			packageManager.getDependencyInfo("@atomicsmash/eslint-config"),
		).toEqual({
			type: "dev",
			packageConstraint: "^10.0.0",
			currentVersion: "10.0.1",
		});
	});
	describe.sequential("ensurePackageIsInstalled()", () => {
		it("should do nothing if dependency is already installed", async () => {
			await packageManager.ensurePackageIsInstalled(
				"@atomicsmash/coding-standards",
			);
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"An acceptable version of @atomicsmash/coding-standards is already installed, skipping...",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [],
				devInstall: [],
			});
		});
		it("should throw an error if the range is invalid", async () => {
			await expect(
				async () =>
					await packageManager.ensurePackageIsInstalled(
						"@atomicsmash/eslint-config",
						{
							packageConstraint: "NotARange",
						},
					),
			).rejects.toThrowError(
				"The packageConstraint value you entered is not a valid semver range.",
			);
		});
		it("should do nothing if dev dependency is already installed", async () => {
			await packageManager.ensurePackageIsInstalled(
				"@atomicsmash/eslint-config",
				{
					type: "dev",
				},
			);
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"An acceptable version of @atomicsmash/eslint-config is already installed, skipping...",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [],
				devInstall: [],
			});
		});
		it("should install a dev dependency package that is missing", async () => {
			await packageManager.ensurePackageIsInstalled("test-package-3", {
				type: "dev",
				packageConstraint: "^2.0.0",
			});
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"test-package-3 is missing, we will automatically install it for you.",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
		it("should not install a dev dependency package that is present and already a higher version", async () => {
			await expect(
				async () =>
					await packageManager.ensurePackageIsInstalled(
						"@atomicsmash/eslint-config",
						{
							type: "dev",
							packageConstraint: "^1.0.0",
						},
					),
			).rejects.toThrowError("NEWER_PACKAGE_FOUND");
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"The package @atomicsmash/eslint-config is already installed and is newer than the requested version. You may encounter issues with your testing setup.",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
		it("should not install a dev dependency package that is present and has a lower version", async () => {
			await expect(
				async () =>
					await packageManager.ensurePackageIsInstalled(
						"@atomicsmash/eslint-config",
						{
							type: "dev",
							packageConstraint: "^12.0.0",
						},
					),
			).rejects.toThrowError("OLDER_PACKAGE_FOUND");
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"The package @atomicsmash/eslint-config is already installed and is older than the requested version. You should manually update the package to match the range: >=12.0.0 <13.0.0-0.",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
		it("should do nothing if normal dependency is already installed", async () => {
			await packageManager.ensurePackageIsInstalled(
				"@atomicsmash/coding-standards",
				{
					type: "normal",
				},
			);
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"An acceptable version of @atomicsmash/coding-standards is already installed, skipping...",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
		it("should install a normal dependency package that is missing", async () => {
			await packageManager.ensurePackageIsInstalled("test-package-4", {
				type: "normal",
				packageConstraint: "^2.0.0",
			});
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"test-package-4 is missing, we will automatically install it for you.",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [`test-package-4@">=2.0.0 <3.0.0-0"`],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
		it("should not install a normal dependency package that is present and already a higher version", async () => {
			await expect(
				async () =>
					await packageManager.ensurePackageIsInstalled(
						"@atomicsmash/coding-standards",
						{
							type: "normal",
							packageConstraint: "^1.0.0",
						},
					),
			).rejects.toThrowError("NEWER_PACKAGE_FOUND");
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"The package @atomicsmash/coding-standards is already installed and is newer than the requested version. You may encounter issues with your testing setup.",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [`test-package-4@">=2.0.0 <3.0.0-0"`],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
		it("should not install a normal dependency package that is present as a dev dependency and already a higher version", async () => {
			await expect(
				async () =>
					await packageManager.ensurePackageIsInstalled(
						"@atomicsmash/eslint-config",
						{
							type: "normal",
							packageConstraint: "^1.0.0",
						},
					),
			).rejects.toThrowError("NEWER_PACKAGE_FOUND");
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"The package @atomicsmash/eslint-config is already installed and is newer than the requested version. You may encounter issues with your testing setup. You should also move this dependency to be a normal dependency.",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [`test-package-4@">=2.0.0 <3.0.0-0"`],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
		it("should not install a normal dependency package that is present and has a lower version", async () => {
			await expect(
				async () =>
					await packageManager.ensurePackageIsInstalled(
						"@atomicsmash/coding-standards",
						{
							type: "normal",
							packageConstraint: "^12.0.0",
						},
					),
			).rejects.toThrowError("OLDER_PACKAGE_FOUND");
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"The package @atomicsmash/coding-standards is already installed and is older than the requested version. You should manually update the package to match the range: >=12.0.0 <13.0.0-0.",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [`test-package-4@">=2.0.0 <3.0.0-0"`],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
		it("should not install a normal dependency package that is present as a dev dependency and has a lower version", async () => {
			await expect(
				async () =>
					await packageManager.ensurePackageIsInstalled(
						"@atomicsmash/eslint-config",
						{
							type: "normal",
							packageConstraint: "^12.0.0",
						},
					),
			).rejects.toThrowError("OLDER_PACKAGE_FOUND");
			expect(consoleSpy).toHaveBeenCalledTimes(1);
			expect(consoleSpy).toHaveBeenCalledWith(
				"The package @atomicsmash/eslint-config is already installed and is older than the requested version. You should manually update the package to match the range: >=12.0.0 <13.0.0-0. You should also move this dependency to be a normal dependency.",
			);
			expect(packageManager.commands).toEqual({
				basic: [],
				install: [`test-package-4@">=2.0.0 <3.0.0-0"`],
				devInstall: [`test-package-3@">=2.0.0 <3.0.0-0"`],
			});
		});
	});
});
