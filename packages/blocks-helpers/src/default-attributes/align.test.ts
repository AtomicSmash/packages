import type { DefaultAttributes } from "@atomicsmash/blocks-helpers";

let defaultAttributes: Record<string, unknown>;
defaultAttributes = {
	// Align is only present in attributes if the value is explicitly set in the editor.
} as const satisfies DefaultAttributes<{ align: true }>;
defaultAttributes = {
	// @ts-expect-error Align should not be present when align is unsupported.
	align: "left",
} as const satisfies DefaultAttributes<Record<string, never>>;
defaultAttributes = {
	// @ts-expect-error Align should not be present when align is unsupported.
	align: "left",
} as const satisfies DefaultAttributes<{ align: false }>;

defaultAttributes = {
	align: "left",
} as const satisfies DefaultAttributes<{ align: true }>;
defaultAttributes = {
	align: "center",
} as const satisfies DefaultAttributes<{ align: true }>;
defaultAttributes = {
	align: "right",
} as const satisfies DefaultAttributes<{ align: true }>;
defaultAttributes = {
	align: "wide",
} as const satisfies DefaultAttributes<{ align: true }>;
defaultAttributes = {
	align: "full",
} as const satisfies DefaultAttributes<{ align: true }>;

defaultAttributes = {
	align: "left",
} as const satisfies DefaultAttributes<{ align: true; alignWide: false }>;
defaultAttributes = {
	align: "center",
} as const satisfies DefaultAttributes<{ align: true; alignWide: false }>;
defaultAttributes = {
	align: "right",
} as const satisfies DefaultAttributes<{ align: true; alignWide: false }>;
defaultAttributes = {
	// @ts-expect-error Wide should not be present when alignWide is unsupported.
	align: "wide",
} as const satisfies DefaultAttributes<{ align: true; alignWide: false }>;
defaultAttributes = {
	// @ts-expect-error Full should not be present when alignWide is unsupported.
	align: "full",
} as const satisfies DefaultAttributes<{ align: true; alignWide: false }>;

defaultAttributes = {
	align: "left",
} as const satisfies DefaultAttributes<{ align: ["left"] }>;
defaultAttributes = {
	align: "center",
} as const satisfies DefaultAttributes<{ align: ["center"] }>;
defaultAttributes = {
	align: "right",
} as const satisfies DefaultAttributes<{ align: ["right"] }>;
defaultAttributes = {
	align: "wide",
} as const satisfies DefaultAttributes<{ align: ["wide"] }>;
defaultAttributes = {
	align: "full",
} as const satisfies DefaultAttributes<{ align: ["full"] }>;

defaultAttributes = {
	// @ts-expect-error Left should not be present when it's value is unsupported.
	align: "left",
} as const satisfies DefaultAttributes<{ align: ["right"] }>;
defaultAttributes = {
	// @ts-expect-error Center should not be present when it's value is unsupported.
	align: "center",
} as const satisfies DefaultAttributes<{ align: ["wide"] }>;
defaultAttributes = {
	// @ts-expect-error Right should not be present when it's value is unsupported.
	align: "right",
} as const satisfies DefaultAttributes<{ align: ["left"] }>;
defaultAttributes = {
	// @ts-expect-error Wide should not be present when it's value is unsupported.
	align: "wide",
} as const satisfies DefaultAttributes<{ align: ["full"] }>;
defaultAttributes = {
	// @ts-expect-error Full should not be present when it's value is unsupported.
	align: "full",
} as const satisfies DefaultAttributes<{ align: ["center"] }>;

defaultAttributes = {
	// Align takes precedence over alignWide, so this is fine.
	align: "wide",
} as const satisfies DefaultAttributes<{ align: ["wide"]; alignWide: false }>;
