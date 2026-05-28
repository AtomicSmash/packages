import type { SmashConfig } from "../types";

/*

Allows getting of values from the smash config using dot.notation and fully typed


*/

// Recursive type to get all dot-notation paths in an object
type DotNotationPaths<T, Prefix extends string = ""> = {
	[K in keyof T & string]: T[K] extends object
		? DotNotationPaths<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
		: `${Prefix}${K}`;
}[keyof T & string];

// Recursive type to get the value at a given dot-notation path
type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
	? Key extends keyof T
		? PathValue<T[Key], Rest>
		: never
	: P extends keyof T
		? T[P]
		: never;

// Map an array of paths to an object of { path: value } pairs
type PathsToTuple<T, Paths extends DotNotationPaths<T>[]> = {
	[I in keyof Paths]: PathValue<T, Paths[I] & string>;
};

type SmashConfigPaths = DotNotationPaths<SmashConfig>;

/*

Get One 

*/

/**
 * Get a single configuration value using dot-notation path syntax
 * @param config - The SmashConfig object to retrieve from
 * @param path - The dot-notation path to the configuration value
 * @returns The value at the specified path
 * @throws {Error} If the configuration value is not found at the specified path
 * @example
 * const apiUrl = getConfig(config, "server.api.url");
 */
export function getConfig<P extends SmashConfigPaths>(
	config: SmashConfig,
	path: P,
): PathValue<SmashConfig, P> {
	const value = path.split(".").reduce<unknown>((acc, key) => {
		if (acc && typeof acc === "object" && key in acc) {
			return (acc as Record<string, unknown>)[key];
		}
		return undefined;
	}, config);

	if (value === undefined) {
		throw new Error(`Missing config value at path: "${path}"`);
	}

	return value as unknown as PathValue<SmashConfig, P>;
}

/**
 * Get multiple configuration values using dot-notation path syntax
 * @param config - The SmashConfig object to retrieve from
 * @param paths - Array of dot-notation paths to retrieve
 * @returns Array of values corresponding to the specified paths
 * @throws {Error} If any configuration value is not found at the specified paths
 * @example
 * const [apiUrl, timeout] = getConfigs(config, ["server.api.url", "server.timeout"]);
 */
export function getConfigs<P extends SmashConfigPaths[]>(
	config: SmashConfig,
	paths: [...P],
): PathsToTuple<SmashConfig, P> {
	return paths.map((path) => getConfig(config, path)) as PathsToTuple<
		SmashConfig,
		P
	>;
}
