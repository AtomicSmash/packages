import { resolve } from "node:path";
import { expect, test, describe } from "vitest";
import { execute, testCommand, packageVersion } from "./utils.js";

describe.concurrent("Base CLI helpers work as intended", () => {
	test("main cli shows error if nothing is added after main command", async () => {
		await expect(execute(`${testCommand}`)).rejects
			.toThrowErrorMatchingInlineSnapshot(`
			{
			  "error": [Error: Command failed: ${testCommand}
			You must specify a command.

			Specify --help to see the available commands.
			],
			  "stderr": "You must specify a command.

			Specify --help to see the available commands.
			",
			  "stdout": "",
			}
		`);
	});
	test("main cli shows help message if --help is added after main command", async () => {
		await expect(execute(`${testCommand} --help`)).resolves
			.toMatchInlineSnapshot(`
			{
			  "error": null,
			  "stderr": "",
			  "stdout": "smash-cli <command>

			Commands:
			  smash-cli blocks          A command to generate WordPress blocks from a src folder.
			  smash-cli setup-database  Create a new database and initialise the site with no content.
			  smash-cli setup           Run all the common setup tasks for a project.
			  smash-cli svg             Generate an SVG sprite from a group of SVGs.
			  smash-cli completion      generate completion script

			Options:
			  -h, --help     Show help  [boolean]
			  -v, --version  Show version number  [boolean]
			",
			}
		`);
	});
	test("main cli shows help message if -h is added after main command", async () => {
		await expect(execute(`${testCommand} -h`)).resolves.toMatchInlineSnapshot(`
			{
			  "error": null,
			  "stderr": "",
			  "stdout": "smash-cli <command>

			Commands:
			  smash-cli blocks          A command to generate WordPress blocks from a src folder.
			  smash-cli setup-database  Create a new database and initialise the site with no content.
			  smash-cli setup           Run all the common setup tasks for a project.
			  smash-cli svg             Generate an SVG sprite from a group of SVGs.
			  smash-cli completion      generate completion script

			Options:
			  -h, --help     Show help  [boolean]
			  -v, --version  Show version number  [boolean]
			",
			}
		`);
	});
	test("main cli shows command not found message if invalid command is provided", async () => {
		await expect(execute(`${testCommand} fake-command`)).rejects
			.toThrowErrorMatchingInlineSnapshot(`
			{
			  "error": [Error: Command failed: ${testCommand} fake-command
			Unknown argument: fake-command

			Specify --help to see the available commands.
			],
			  "stderr": "Unknown argument: fake-command

			Specify --help to see the available commands.
			",
			  "stdout": "",
			}
		`);
	});
	test("main cli shows correct version number if --version is added after main command", async () => {
		await expect(execute(`${testCommand} --version`)).resolves
			.toMatchInlineSnapshot(`
			{
			  "error": null,
			  "stderr": "",
			  "stdout": "${packageVersion}
			",
			}
		`);
	});
	test("main cli shows correct version number if -v is added after main command", async () => {
		await expect(execute(`${testCommand} -v`)).resolves.toMatchInlineSnapshot(`
			{
			  "error": null,
			  "stderr": "",
			  "stdout": "${packageVersion}
			",
			}
		`);
	});
});
