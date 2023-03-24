import { mainCommand } from "./utils.js";

export const helpMessage = `
  Atomic Smash CLI.

  Available commands:
    svg - generate an SVG sprite from a group of SVGs.
    blocks - compile WP blocks source code

  Options:
    --help, -h          Print a help message for the command and exit.
    --version, -v       Print the CLI version and exit.
    --debug             Show NodeJS debugging information for errors.
`;

export const noCommandFound = `
  Error: Command not found. Run ${mainCommand} --help to see available commands.
`;
