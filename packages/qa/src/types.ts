/** Environments a journey can run against, as defined in smash.config.ts. */
export type Environment = "local" | "staging";

/** ARIA roles most often targeted by journeys. Any valid ARIA role string is accepted. */
export type AriaRole =
	| "button"
	| "link"
	| "heading"
	| "textbox"
	| "checkbox"
	| "radio"
	| "combobox"
	| "listbox"
	| "option"
	| "searchbox"
	| "spinbutton"
	| "tab"
	| "menuitem"
	| "dialog"
	| "navigation"
	| "img"
	| (string & {});

/** How a step finds an element. Healing edits these, never the intent of the step. */
export type Target =
	| { by: "role"; role: AriaRole; name?: string; exact?: boolean }
	| { by: "label"; label: string; exact?: boolean }
	| { by: "text"; text: string; exact?: boolean }
	| { by: "testId"; testId: string }
	| { by: "css"; selector: string };

/** A value read from the environment (e.g. `.env`) at run time. */
export type EnvValue = { env: string };

/** A value read from the per-environment `data` in qa/qa.config.ts. */
export type DataValue = { data: string };

/** A literal string or a reference resolved at run time. */
export type Value = string | EnvValue | DataValue;

/** Where a step was declared, so reports can point at the exact line to heal. */
export type SourceLocation = { file: string; line: number; column: number };

/** A single journey step. Steps are plain data so they can be diffed, reported and healed. */
export type Step =
	| { action: "visit"; path: Value }
	| { action: "click"; target: Target }
	| { action: "fill"; target: Target; value: Value }
	| { action: "select"; target: Target; option: Value }
	| { action: "check"; target: Target; checked: boolean }
	| { action: "press"; key: string; target?: Target }
	| { action: "waitFor"; target: Target }
	| { action: "expectText"; text: Value }
	| { action: "expectVisible"; target: Target }
	| { action: "expectUrl"; path: Value }
	| { action: "expectTitle"; title: Value }
	| { action: "expectNoConsoleErrors" }
	| { action: "a11y" };

/** A step together with where it was declared. */
export type LocatedStep = Step & { location?: SourceLocation };

/** A user journey: the unit that `smash-qa run` executes and the skill heals. */
export type Journey = {
	name: string;
	/** Environments to run on. Defaults to every environment. */
	envs?: Environment[];
	/** Whether the journey creates or changes data (orders, form entries, accounts). */
	mutates?: boolean;
	tags?: string[];
	/** A WordPress role to run as, logged in as the `smash-qa-<role>` user. Logged out when omitted. */
	as?: string;
	steps: LocatedStep[];
	/** Where the journey was defined; set by `journey()`. */
	location?: SourceLocation;
};

/** What a journey file default-exports: one journey, or several related ones. */
export type JourneyExport = Journey | Journey[];

/** Per-project QA settings in qa/qa.config.ts. */
export type QaConfig = {
	/** The journeys to run, usually one import per journey file. Comment one out to skip it. */
	journeys?: JourneyExport[];
	/** Named test data per environment, referenced in journeys with `data("key")`. */
	data?: Partial<Record<Environment, Record<string, string>>>;
	/** Per-journey timeout in milliseconds. */
	timeout?: number;
};

/** A login cookie minted for a journey's `as` role, in Playwright's cookie shape. */
export type SessionCookie = {
	name: string;
	value: string;
	domain: string;
	path: string;
	expires: number;
	httpOnly: boolean;
	secure: boolean;
	sameSite: "Lax";
};

/** Context handed from the CLI to the Playwright process for a single run. */
export type RunContext = {
	env: Environment;
	baseURL: string;
	httpCredentials?: { username: string; password: string };
	data: Record<string, string>;
	/** Login cookies per role, for journeys with `as`. */
	sessions: Record<string, SessionCookie[]>;
	browsers: "chromium" | "all";
	timeout: number;
	qaDir: string;
	resultsDir: string;
	reportFile: string;
};
