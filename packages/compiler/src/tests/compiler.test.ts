import { existsSync } from "node:fs";
import { readFile, rm as deleteDir } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { execute } from "../utils";

async function tearDown() {
	await deleteDir(`${import.meta.dirname}/dist/`, {
		recursive: true,
		force: true,
	}).catch((error: NodeJS.ErrnoException) => {
		if (error.code === "ENOENT") {
			return;
		}
	});
}

let manifest: Record<string, string>;

describe("Compiler tests", () => {
	beforeAll(async () => {
		await execute(
			// Node env must be set to enable the correct browserslist config.
			`cd ${import.meta.dirname} && NODE_ENV=production node ${resolve(import.meta.dirname, "../../dist/cli.js")} --in src --out dist`,
		);
		manifest = await readFile(
			resolve(import.meta.dirname, "dist/assets-manifest.json"),
			{
				encoding: "utf8",
			},
		).then((response) => {
			return JSON.parse(response) as Record<string, string>;
		});
	});

	test("Testing CSS output", async () => {
		const pure = await readFile(
			resolve(import.meta.dirname, `dist/${manifest["styles/pure.css"]}`),
			{
				encoding: "utf8",
			},
		);
		const style = await readFile(
			resolve(import.meta.dirname, `dist/${manifest["styles/style.scss"]}`),
			{
				encoding: "utf8",
			},
		);
		const subfolderStyle = await readFile(
			resolve(
				import.meta.dirname,
				`dist/${manifest["styles/subfolder/style-subfolder.scss"]}`,
			),
			{
				encoding: "utf8",
			},
		);

		expect(manifest["styles/subfolder/_partial.scss"]).toBeUndefined();
		expect(manifest["styles/subfolder/failure.css"]).toBeUndefined();

		expect(pure).toMatchInlineSnapshot(
			`"body{background-color:red;color:blue}"`,
		);
		expect(style).toMatchInlineSnapshot(
			`"h1{color:purple}body{background-color:green;border:1px solid red;color:#fff;padding:1rem 2rem}"`,
		);
		expect(subfolderStyle).toMatchInlineSnapshot(
			`"body{background-color:green;border:1px solid red;color:#fff}"`,
		);
	});

	test("Test scripts", async () => {
		const jsFileName = manifest["scripts/javascript.js"];
		expect(existsSync(resolve(import.meta.dirname, `dist/${jsFileName}`))).toBe(
			true,
		);
		await expect(
			execute(
				`node ${resolve(import.meta.dirname, `dist/${jsFileName}`)}`,
			).then((output) => output.stdout),
		).resolves.toMatchInlineSnapshot(`
			"Hello this is a console log. 
			Hello this is a console log. Some extra message.
			"
		`);
		const tsFileName = manifest["scripts/typescript.ts"];
		expect(existsSync(resolve(import.meta.dirname, `dist/${tsFileName}`))).toBe(
			true,
		);
		await expect(
			execute(
				`node ${resolve(import.meta.dirname, `dist/${tsFileName}`)}`,
			).then((output) => output.stdout),
		).resolves.toMatchInlineSnapshot(`
			"Hello this is a console log. 
			Hello this is a console log. Some extra message.
			"
		`);
	});

	test("Test fonts", () => {
		expect(
			existsSync(resolve(import.meta.dirname, "dist/fonts/Roboto-Regular.ttf")),
		).toBe(true);
		expect(
			existsSync(resolve(import.meta.dirname, "dist/fonts/Roboto-Medium.ttf")),
		).toBe(true);
	});

	test("Test images", () => {
		expect(
			existsSync(resolve(import.meta.dirname, "dist/images/image-01.jpeg")),
		).toBe(true);
		expect(
			existsSync(resolve(import.meta.dirname, "dist/images/image-02.png")),
		).toBe(true);
	});

	test("Test icons", () => {
		expect(
			existsSync(resolve(import.meta.dirname, "dist/icons/sprite.svg")),
		).toBe(true);
	});

	afterAll(async () => {
		await tearDown();
	});
});
