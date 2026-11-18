import type { Value } from "../types.js";

/**
 * Resolve a literal, `env()` or `data()` value for the current run, failing loudly when it is missing.
 */
export function resolveValue(
	value: Value,
	{
		data,
		environment = process.env,
	}: { data: Record<string, string>; environment?: NodeJS.ProcessEnv },
): string {
	if (typeof value === "string") {
		return value;
	}
	if ("env" in value) {
		const resolved = environment[value.env];
		if (resolved === undefined) {
			throw new Error(
				`Environment variable "${value.env}" is not set. Add it to the project's .env file.`,
			);
		}
		return resolved;
	}
	const resolved = data[value.data];
	if (resolved === undefined) {
		throw new Error(
			`Test data "${value.data}" is not defined for this environment in qa/qa.config.ts.`,
		);
	}
	return resolved;
}

/**
 * Describe a value for step titles and reports without leaking secrets from the environment.
 */
export function describeValue(value: Value): string {
	if (typeof value === "string") {
		return `"${value}"`;
	}
	return "env" in value ? `env(${value.env})` : `data(${value.data})`;
}

/**
 * Check a URL path against an expected path, where a trailing `*` matches any suffix.
 */
export function pathMatches(actualPath: string, expectedPath: string): boolean {
	const trim = (path: string) => path.replace(/(.)\/+$/, "$1");
	return expectedPath.endsWith("*")
		? actualPath.startsWith(expectedPath.slice(0, -1))
		: trim(actualPath) === trim(expectedPath);
}
