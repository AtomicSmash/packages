import { type TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom/vitest";
declare module "vitest" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any -- extending an existing interface.
	interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type -- extending an existing interface.
	interface AsymmetricMatchersContaining
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- extending an existing interface.
		extends TestingLibraryMatchers<any, any> {}
}
