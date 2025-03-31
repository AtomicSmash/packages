import { expect, test, describe } from "vitest";
import { helpMessage, noCommandFound } from "./messages.js";
import { execute, testCommand, packageVersion } from "./utils.js";

describe.concurrent("Base CLI helpers work as intended", () => {
	test("main cli shows help message if nothing is added after main command", async () => {
		await expect(execute(`${testCommand}`)).resolves.toEqual({
			error: null,
			stdout: `${helpMessage}\n`,
			stderr: "",
		});
	});
	test("main cli shows help message if --help is added after main command", async () => {
		await expect(execute(`${testCommand} --help`)).resolves.toEqual({
			error: null,
			stdout: `${helpMessage}\n`,
			stderr: "",
		});
	});
	test("main cli shows help message if -h is added after main command", async () => {
		await expect(execute(`${testCommand} -h`)).resolves.toEqual({
			error: null,
			stdout: `${helpMessage}\n`,
			stderr: "",
		});
	});
	test("main cli shows command not found message if invalid command is provided", async () => {
		await expect(execute(`${testCommand} fake-command`)).rejects
			.toThrowErrorMatchingInlineSnapshot(`
			{
			  "error": [Error: Command failed: ${testCommand} fake-command

			  Error: Command not found. Run smash-cli --help to see available commands.

			],
			  "stderr": "
			  Error: Command not found. Run smash-cli --help to see available commands.

			",
			  "stdout": "",
			}
		`);
	});
	test("main cli shows correct version number if --version is added after main command", async () => {
		await expect(execute(`${testCommand} --version`)).resolves.toEqual({
			error: null,
			stdout: `${packageVersion}\n`,
			stderr: "",
		});
	});
	test("main cli shows correct version number if -v is added after main command", async () => {
		await expect(execute(`${testCommand} -v`)).resolves.toEqual({
			error: null,
			stdout: `${packageVersion}\n`,
			stderr: "",
		});
	});
});
