import { existsSync, unlink, readFileSync } from "node:fs";
import { resolve as resolvePath, dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, describe, afterAll } from "vitest";
import { testCommand, execute } from "../utils.js";
import { svgHelpMessage } from "./svg.js";

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = pathDirname(__filename);

const testSVGsIn = resolvePath(__dirname, "../tests/svg/in");
const testSVGsOut = resolvePath(__dirname, "../tests/svg/out");

describe("SVG command works as intended", () => {
	test("svg command correctly displays help message", async () => {
		await expect(execute(`${testCommand} svg --help`)).resolves.toEqual({
			error: null,
			stdout: `${svgHelpMessage}\n`,
			stderr: "",
		});
	});
	test("svg command correctly displays --in flag missing error if no flags added", async () => {
		const command = `${testCommand} svg`;
		await expect(execute(command)).rejects.toEqual({
			error: new Error(
				`Command failed: ${command}\nError: You need to provide a value for the --in flag.\n`,
			),
			stdout: "",
			stderr: "Error: You need to provide a value for the --in flag.\n",
		});
	});
	test("svg command correctly displays --in flag missing error if in flag is missing", async () => {
		const command = `${testCommand} svg --out ${testSVGsOut}`;
		await expect(execute(command)).rejects.toEqual({
			error: new Error(
				`Command failed: ${command}\nError: You need to provide a value for the --in flag.\n`,
			),
			stdout: "",
			stderr: "Error: You need to provide a value for the --in flag.\n",
		});
	});
	test("svg command correctly displays --out flag missing error if out flag is missing", async () => {
		const command = `${testCommand} svg --in ${testSVGsIn}`;
		await expect(execute(command)).rejects.toEqual({
			error: new Error(
				`Command failed: ${command}\nError: You need to provide a value for the --out flag.\n`,
			),
			stdout: "",
			stderr: "Error: You need to provide a value for the --out flag.\n",
		});
	});
	test("svg command produces the correct svg output", async () => {
		await execute(`${testCommand} svg --in ${testSVGsIn} --out ${testSVGsOut}`);
		expect(existsSync(`${testSVGsOut}/sprite.svg`)).toBe(true);
		expect(readFileSync(`${testSVGsOut}/sprite.svg`, "utf8")).toBe(
			// spellchecker: disable-next-line
			'<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><symbol fill="none" viewBox="0 0 25 24" id="ArrowRight" xmlns="http://www.w3.org/2000/svg"><path d="M24.707 12.707a1 1 0 0 0 0-1.414l-6.364-6.364a1 1 0 1 0-1.414 1.414L22.586 12l-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364ZM0 13h24v-2H0v2Z" fill="currentColor"/></symbol><symbol fill="none" viewBox="0 0 51 30" id="CardMastercard" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#ba)"><path d="M12.996 29.934v-1.99c0-.762-.463-1.261-1.26-1.261-.397 0-.83.131-1.127.564-.232-.363-.564-.564-1.063-.564-.332 0-.664.1-.927.464v-.398h-.695v3.185h.695v-1.759c0-.564.298-.83.761-.83.464 0 .696.297.696.83v1.76h.695v-1.76c0-.564.332-.83.761-.83.464 0 .695.297.695.83v1.76h.77Zm10.315-3.185h-1.128v-.963h-.695v.963h-.63v.63h.63v1.461c0 .73.297 1.16 1.093 1.16.297 0 .63-.1.861-.232l-.2-.6c-.201.132-.433.167-.6.167-.331 0-.463-.201-.463-.53V27.38h1.128v-.63h.004Zm5.903-.07a.943.943 0 0 0-.83.464v-.398h-.696v3.185h.696v-1.793c0-.53.231-.832.664-.832.131 0 .297.035.433.066l.2-.665c-.139-.027-.336-.027-.467-.027Zm-8.92.333c-.332-.232-.796-.333-1.294-.333-.796 0-1.325.398-1.325 1.029 0 .53.398.83 1.093.927l.332.035c.363.066.564.166.564.333 0 .232-.266.398-.73.398-.464 0-.83-.166-1.062-.333l-.333.53c.364.267.862.398 1.36.398.927 0 1.46-.433 1.46-1.028 0-.565-.432-.862-1.093-.963l-.332-.035c-.297-.034-.53-.1-.53-.297 0-.232.233-.364.6-.364.397 0 .795.166.996.267l.294-.564Zm18.5-.333a.943.943 0 0 0-.83.464v-.398h-.695v3.185h.695v-1.793c0-.53.232-.832.665-.832.131 0 .297.035.433.066l.2-.657c-.135-.035-.332-.035-.467-.035Zm-8.884 1.663c0 .962.664 1.658 1.692 1.658.463 0 .795-.1 1.128-.363l-.333-.565c-.266.201-.529.298-.83.298-.564 0-.962-.398-.962-1.029 0-.599.398-.997.962-1.028.297 0 .564.1.83.298l.333-.565c-.333-.266-.665-.363-1.128-.363-1.028-.004-1.692.696-1.692 1.659Zm6.432 0v-1.593h-.696v.398c-.231-.298-.564-.464-.996-.464-.897 0-1.592.696-1.592 1.659 0 .962.695 1.658 1.592 1.658.463 0 .796-.166.996-.464v.398h.696v-1.593Zm-2.554 0c0-.565.363-1.029.962-1.029.564 0 .962.433.962 1.029 0 .564-.398 1.028-.962 1.028-.595-.035-.962-.468-.962-1.029Zm-8.321-1.663c-.927 0-1.592.665-1.592 1.659 0 .997.665 1.658 1.627 1.658.463 0 .927-.131 1.294-.433l-.332-.499a1.578 1.578 0 0 1-.928.333c-.432 0-.861-.201-.962-.762h2.353v-.266c.031-1.025-.568-1.69-1.46-1.69Zm0 .6c.432 0 .73.266.796.76h-1.658c.066-.428.363-.76.862-.76Zm17.276 1.063v-2.854h-.695v1.659c-.232-.298-.564-.464-.997-.464-.896 0-1.592.696-1.592 1.659 0 .962.696 1.658 1.592 1.658.464 0 .796-.166.997-.464v.398h.695v-1.593Zm-2.553 0c0-.565.363-1.029.962-1.029.563 0 .961.433.961 1.029 0 .564-.398 1.028-.962 1.028-.598-.035-.962-.468-.962-1.029Zm-23.28 0v-1.593h-.696v.398c-.231-.298-.564-.464-.996-.464-.897 0-1.592.696-1.592 1.659 0 .962.695 1.658 1.592 1.658.463 0 .795-.166.996-.464v.398h.696v-1.593Zm-2.585 0c0-.565.363-1.029.962-1.029.564 0 .962.433.962 1.029 0 .564-.398 1.028-.962 1.028-.599-.035-.962-.468-.962-1.029Z" fill="#000"/><path d="M30.509 2.555H20.062v18.781H30.51V2.556Z" fill="#FF5A00"/><path d="M20.758 11.946c0-3.816 1.792-7.202 4.543-9.39A11.868 11.868 0 0 0 17.937 0C11.34 0 6 5.343 6 11.946s5.339 11.946 11.937 11.946c2.786 0 5.34-.963 7.364-2.556a11.925 11.925 0 0 1-4.543-9.39Z" fill="#EB001B"/><path d="M44.602 11.946c0 6.603-5.34 11.946-11.938 11.946-2.785 0-5.339-.963-7.363-2.556a11.884 11.884 0 0 0 4.543-9.39c0-3.816-1.793-7.202-4.543-9.39A11.849 11.849 0 0 1 32.66 0C39.262 0 44.6 5.378 44.6 11.946Z" fill="#F79E1B"/></g><defs><clipPath id="ba"><path fill="#fff" transform="translate(.5)" d="M0 0h50v30H0z"/></clipPath></defs></symbol><symbol fill="none" viewBox="0 0 24 24" id="Thumbtack" xmlns="http://www.w3.org/2000/svg"><path d="m15.115 10.155-.057-.748.057.748c.83-.063 3.136-.024 5.457 1.971l-8.446 8.446c-1.995-2.32-2.034-4.628-1.97-5.457a1.615 1.615 0 0 0-.455-1.267l-2.183-2.184a1.5 1.5 0 0 0-1.866-.205l-1.636 1.042-1.455-1.455 8.485-8.485L12.5 4.015l-1.042 1.637a1.5 1.5 0 0 0 .205 1.866L13.848 9.7c.354.355.833.487 1.267.454Z" stroke="currentColor" stroke-width="1.5"/><mask id="ca" fill="currentColor"><path d="m15.287 16.35 1.06-1.062 4.546 4.546.228 1.288-1.288-.227-4.546-4.546Z"/></mask><path d="m15.287 16.35 1.06-1.062 4.546 4.546.228 1.288-1.288-.227-4.546-4.546Z" fill="currentColor"/><path d="m15.287 16.35-1.06-1.062-1.061 1.061 1.06 1.06 1.061-1.06Zm1.06-1.062 1.061-1.06-1.06-1.06-1.06 1.06 1.06 1.06Zm4.546 4.546 1.478-.26-.082-.466-.335-.335-1.06 1.061Zm-1.06 1.06-1.06 1.062.334.334.465.082.26-1.477Zm1.288.228-.26 1.477 2.11.373-.373-2.11-1.477.26Zm-4.773-3.712 1.06-1.06-2.12-2.122-1.062 1.06 2.122 2.122Zm-1.06-1.06 4.545 4.545 2.121-2.122-4.546-4.545-2.12 2.121Zm5.605 3.484-4.545-4.545-2.122 2.12 4.546 4.547 2.122-2.122Zm-1.477.26.228 1.289 2.954-.522-.227-1.288-2.955.522Zm1.965-.45-1.288-.226-.52 2.954 1.287.227.521-2.954Z" mask="url(#ca)"/></symbol></svg>',
		);
	});
	afterAll(() => {
		// Delete sprite once all tests are complete to avoid false positives on subsequent tests
		unlink(`${testSVGsOut}/sprite.svg`, (err) => {
			if (err) throw err;
			console.log("Successfully deleted sprite.svg");
		});
	});
});
