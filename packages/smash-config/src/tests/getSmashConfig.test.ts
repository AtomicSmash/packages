import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { getSmashConfig } from "../utils/getSmashConfig";

let originalCWDFunction: typeof process.cwd;

describe.sequential("getSmashConfig()", () => {
	beforeAll(() => {
		originalCWDFunction = process.cwd.bind(this);
	});
	afterAll(() => {
		process.cwd = originalCWDFunction;
	});
	test("No version", async () => {
		process.cwd = () => `${import.meta.dirname}/artifacts/no-version`;
		await expect(getSmashConfig()).resolves.toMatchInlineSnapshot(`
			{
			  "assetsOutputFolder": "dist",
			  "composerInstallPaths": [],
			  "npmInstallPaths": [],
			  "projectName": "smash-config-tests",
			  "scssAliases": {
			    "importers": [
			      {
			        "findFileUrl": [Function],
			      },
			      {
			        "findFileUrl": [Function],
			      },
			    ],
			  },
			  "themeFolderName": "smash-config-tests",
			  "themePath": "theme",
			  "version": 1,
			}
		`);
	});
	test("v1", async () => {
		process.cwd = () => `${import.meta.dirname}/artifacts/v1`;
		await expect(getSmashConfig()).resolves.toMatchInlineSnapshot(`
			{
			  "assetsOutputFolder": "dist",
			  "composerInstallPaths": [],
			  "npmInstallPaths": [],
			  "projectName": "smash-config-tests",
			  "scssAliases": {
			    "importers": [
			      {
			        "findFileUrl": [Function],
			      },
			      {
			        "findFileUrl": [Function],
			      },
			    ],
			  },
			  "themeFolderName": "smash-config-tests",
			  "themePath": "theme",
			  "version": 1,
			}
		`);
	});
	test("v2", async () => {
		process.cwd = () => `${import.meta.dirname}/artifacts/v2`;
		await expect(getSmashConfig()).resolves.toMatchInlineSnapshot(`
			{
			  "assetsOutputFolder": "dist",
			  "composerInstallPaths": [],
			  "npmInstallPaths": [],
			  "projectName": "smash-config-tests",
			  "pullMedia": {
			    "monthsToPull": -1,
			  },
			  "scssAliases": {
			    "importers": [
			      {
			        "findFileUrl": [Function],
			      },
			      {
			        "findFileUrl": [Function],
			      },
			    ],
			  },
			  "staging": {
			    "dbPrefix": "wp_",
			    "ssh": {
			      "host": "000.000.000.000",
			      "username": "test",
			    },
			    "uploadsPath": "public/wp-content/uploads",
			    "url": "smash-config.test",
			    "webRoot": "/test/",
			  },
			  "themeFolderName": "smash-config-tests",
			  "themePath": "theme",
			  "uploadsPath": "public/wp-content/uploads",
			  "version": 2,
			}
		`);
	});
	test("v1 fails if v2 needed", async () => {
		process.cwd = () => `${import.meta.dirname}/artifacts/v1`;
		await expect(getSmashConfig(2)).rejects.toMatchInlineSnapshot(
			`[Error: A smash config was found but it is not up to date. Please update to at least version 2.]`,
		);
	});
});
