// force Typescript to simplify the type
type Pretty<T> = { [K in keyof T]: T[K] } & NonNullable<unknown>;
