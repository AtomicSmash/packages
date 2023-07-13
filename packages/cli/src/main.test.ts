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
		await expect(execute(`${testCommand} fake-command`)).rejects.toEqual({
			error: new Error(
				`Command failed: ${testCommand} fake-command\n${noCommandFound}\n`,
			),
			stdout: "",
			stderr: `${noCommandFound}\n`,
		});
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
