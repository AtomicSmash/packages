import type { PackageJson } from "type-fest";
// copy files

// add to gitignore
// /test-results/
// /playwright-report/
// /blob-report/
// /playwright/.cache/

// Install packages
// @atomicsmash/test-utils
// @playwright/test
// @types/node
// msw
// close-with-grace
// cross-env

async function hasDependency(packageName: string) {
	const projectPackageJson = (await import(
		`${process.cwd()}/+package.json`
	)) as PackageJson;
	return (
		projectPackageJson.dependencies &&
		packageName in projectPackageJson.dependencies
	);
}

const commands: string[] = [];
if (!(await hasDependency("@atomicsmash/test-utils"))) {
	commands.push(`npm install --save-dev @atomicsmash/test-utils`);
}
if (!(await hasDependency("@playwright/test"))) {
	commands.push(`npm install --save-dev @playwright/test`);
}
if (!(await hasDependency("close-with-grace"))) {
	commands.push(`npm install --save-dev close-with-grace`);
}
if (!(await hasDependency("msw"))) {
	commands.push(`npm install --save-dev msw`);
}
if (!(await hasDependency("cross-env"))) {
	commands.push(`npm install --save-dev cross-env`);
}
if (!(await hasDependency("@types/node"))) {
	const currentNodeVersion = process.versions.node
		.split(".")
		.reduce<{ major: number; minor: number; patch: number }>(
			(versionObject, currentValue, currentIndex) => {
				if (currentIndex === 0) {
					versionObject.major = Number(currentValue);
				}
				if (currentIndex === 1) {
					versionObject.minor = Number(currentValue);
				}
				if (currentIndex === 2) {
					versionObject.patch = Number(currentValue);
				}
				return versionObject;
			},
			{} as { major: number; minor: number; patch: number },
		);
	commands.push(
		`npm install --save-dev --save-exact @types/node@${currentNodeVersion.major}.${currentNodeVersion.minor}`,
	);
}
