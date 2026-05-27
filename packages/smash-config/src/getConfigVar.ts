import { SmashConfig } from ".";

// Recursive type to get all dot-notation paths in an object
type DotNotationPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? DotNotationPaths<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
    : `${Prefix}${K}`;
}[keyof T & string];

// Recursive type to get the value at a given dot-notation path
type PathValue<T, P extends string> =
  P extends `${infer Key}.${infer Rest}`
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

export function getConfig<P extends SmashConfigPaths>(
  config: SmashConfig,
  path: P
): PathValue<SmashConfig, P> {
    const value = path.split(".").reduce((acc, key) => (acc as any)?.[key], config as any);
  
  if (value === undefined) {
    throw new Error(`Missing config value at path: "${path}"`);
  }

  return value as unknown as PathValue<SmashConfig, P>;
}

export function getConfigs<P extends SmashConfigPaths[]>(
  config: SmashConfig,
  paths: [...P]
): PathsToTuple<SmashConfig, P> {
  return paths.map((path) => getConfig(config, path)) as PathsToTuple<SmashConfig, P>;
}