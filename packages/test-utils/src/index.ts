import type {
	Page,
	Browser,
	PlaywrightTestConfig,
	PlaywrightTestArgs,
	PlaywrightTestOptions,
} from "@playwright/test";
import type { SerialFrameSelector } from "axe-core";
import type { Config } from "lighthouse";
import { AxeBuilder } from "@axe-core/playwright";
import { test as base, chromium, devices } from "@playwright/test";
import getPort from "get-port";
import lighthouseDesktopConfig from "lighthouse/core/config/lr-desktop-config.js";
import lighthouseMobileConfig from "lighthouse/core/config/lr-mobile-config.js";
import { playAudit } from "playwright-lighthouse";

const { expect } = base;

export type WordPressUserRole =
	| "unauthenticated"
	| "subscriber"
	| "contributor"
	| "author"
	| "editor"
	| "admin"
	| "super-admin";
export type WooCommerceUserRole = "customer" | "shop-manager";
export type UserRole = WordPressUserRole | WooCommerceUserRole;
export type PageList = {
	url: string;
	name: string;
	slug?: string;
	minimumUserPrivilege?: UserRole;
}[];

export function doesRoleHaveHighEnoughPermissions(
	userRole: WordPressUserRole | WooCommerceUserRole,
	minimumRolePermission: WordPressUserRole | WooCommerceUserRole,
): boolean {
	if (userRole === minimumRolePermission) {
		return true;
	}
	switch (userRole) {
		case "super-admin":
			return true;
		case "admin":
			return minimumRolePermission !== "super-admin";
		case "shop-manager":
			return !["super-admin", "admin"].includes(minimumRolePermission);
		case "editor":
			return !["super-admin", "admin", "shop-manager"].includes(
				minimumRolePermission,
			);
		case "author":
			return !["super-admin", "admin", "shop-manager", "editor"].includes(
				minimumRolePermission,
			);
		case "contributor":
			return ![
				"super-admin",
				"admin",
				"shop-manager",
				"editor",
				"author",
			].includes(minimumRolePermission);
		case "customer":
			return ![
				"super-admin",
				"admin",
				"shop-manager",
				"editor",
				"author",
				"contributor",
			].includes(minimumRolePermission);
		case "subscriber":
			return ![
				"super-admin",
				"admin",
				"shop-manager",
				"editor",
				"author",
				"contributor",
				"customer",
			].includes(minimumRolePermission);
		case "unauthenticated":
			return minimumRolePermission === "unauthenticated";
	}
}

export type AuthenticatePageFunction = (
	{ page }: { page: Page },
	use: (r: Page) => Promise<void>,
) => Promise<void>;

export const playwrightConfig = {
	testDir: "./tests/e2e",
	timeout: 30 * 1000,
	expect: {
		timeout: 10 * 1000,
	},
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? "github" : "dot",
	use: {
		actionTimeout: 0,
		trace: "on-first-retry",
	},
	snapshotDir: "./screenshots",
	snapshotPathTemplate:
		"{snapshotDir}/{platform}/{testFileName}-snapshots/{arg}{ext}",
} satisfies PlaywrightTestConfig;

export const lighthouseTest = base.extend<
	PlaywrightTestArgs & PlaywrightTestOptions,
	{ port: number; browser: Browser }
>({
	port: [
		// eslint-disable-next-line no-empty-pattern -- destructure pattern is required by playwright
		async ({}, use) => {
			// Assign a unique port for each playwright worker to support parallel tests
			const port = await getPort();
			await use(port);
		},
		{ scope: "worker" },
	],

	browser: [
		async ({ port }, use) => {
			const browser = await chromium.launch({
				args: [`--remote-debugging-port=${port}`],
			});
			await use(browser);
		},
		{ scope: "worker" },
	],
});

type LighthouseTestFunction = Parameters<typeof lighthouseTest>[2];

export const doLighthouseTest: (
	pageToTest: {
		url: string | (() => string | Promise<string>);
		name: string;
		slug?: string;
	},
	type: "desktop" | "mobile",
	disableAuditLogs?: boolean,
) => LighthouseTestFunction = (pageToTest, type, disableAuditLogs = false) =>
	async function ({ page, port }) {
		await page.goto(
			typeof pageToTest.url === "string"
				? pageToTest.url
				: await pageToTest.url(),
		);
		await playAudit({
			page,
			port,
			thresholds: {
				performance: 85,
				accessibility: 85,
				"best-practices": 85,
				seo: 85,
			},
			reports: {
				formats: {
					html: true,
				},
				directory: "lighthouse/latest-lighthouse-report",
				name: `${pageToTest.slug ?? slugify(pageToTest.name)}-${type}`,
			},
			config: (type === "desktop"
				? lighthouseDesktopConfig
				: lighthouseMobileConfig) as Config,
			ignoreError: true,
			disableLogs: disableAuditLogs,
		});
		await page.goto(
			`file://${process.cwd()}/lighthouse/latest-lighthouse-report/${
				pageToTest.slug ?? slugify(pageToTest.name)
			}-${type}.html`,
		);
	};

export async function checkAccessibility(
	page: Page,
	{
		includes,
		excludes,
	}: {
		includes?: SerialFrameSelector[];
		excludes?: SerialFrameSelector[];
	} = {},
) {
	let builder;
	// TODO: Wait for @wordpress/scripts to update dependency constraint, then remove this "as" declaration.
	builder = new AxeBuilder({ page } as {
		page: ConstructorParameters<typeof AxeBuilder>[0]["page"];
	});
	if (includes) {
		for (const include of includes) {
			builder = builder.include(include);
		}
	}
	if (excludes) {
		for (const exclude of excludes) {
			builder = builder.exclude(exclude);
		}
	}
	builder = builder.exclude("#userback_button_container"); // Ignore userback testing tool
	const accessibilityScanResults = await builder.analyze();

	expect(
		accessibilityScanResults.violations.filter((violation) => {
			if (
				violation.id === "aria-allowed-attr" &&
				violation.nodes[0] &&
				violation.nodes[0].html.startsWith("<button") &&
				violation.nodes[0].html.includes(`role="switch"`)
			) {
				return false;
			}
			return true;
		}),
	).toEqual([]);
}

export const checkPrivilegedPages =
	(pagesToTest: PageList) =>
	async ({ page }: { page: Page }) => {
		for (const pageToTest of pagesToTest) {
			const response = await page.goto(pageToTest.url);
			expect(response).not.toBeNull();
			const nonNullResponse = response as NonNullable<typeof response>;
			expect(nonNullResponse.status()).toBe(401);
		}
	};
export const checkForLoremIpsum =
	(pagesToTest: PageList) =>
	async ({ page }: { page: Page }) => {
		for (const pageToTest of pagesToTest) {
			await page.goto(pageToTest.url);
			await expect(page.getByText("Lorem ipsum")).not.toBeAttached({
				timeout: 100,
			});
		}
	};

export function slugify(stringToSlugify: string) {
	// REGEX_1: Match any character that isn't alphanumeric, underscore, whitespace and underscore
	// REGEX_2: Match any character that is underscore, whitespace and underscore
	// REGEX_3: Match any hyphens at the start or the end of the string
	return stringToSlugify
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|(?<!-)-+$/g, "");
}

export function generateProjectsForAllBrowsers(
	baseProject: NonNullable<PlaywrightTestConfig["projects"]>[number],
) {
	const projects: NonNullable<PlaywrightTestConfig["projects"]> = [];
	for (const browser of [
		{
			name: `Chrome`,
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 2566, height: 1080 },
			},
			grepInvert: /@mobile/, // i.e. don't run tests with these tags
		},
		{
			name: `Firefox`,
			use: {
				...devices["Desktop Firefox"],
				viewport: { width: 1920, height: 1080 },
			},
			grepInvert: /@mobile|@lighthouse/,
		},
		{
			name: `Safari`,
			use: {
				...devices["Desktop Safari"],
				viewport: { width: 1280, height: 720 },
			},
			grepInvert: /@mobile|@lighthouse/,
		},
		{
			name: `Chrome_mobile`,
			use: { ...devices["Pixel 5"] },
			grepInvert: /@desktop/,
		},
		{
			name: `Safari_mobile`,
			use: { ...devices["iPhone 12"] },
			grepInvert: /@desktop|@lighthouse/,
		},
	]) {
		projects.push({
			...baseProject,
			name: `${baseProject.name}__${browser.name}`,
			use: {
				...baseProject.use,
				...browser.use,
			},
			grepInvert: [
				...[baseProject.grepInvert].flat(1),
				...[browser.grepInvert].flat(1),
			].filter((value) => value !== undefined),
		});
	}
	return projects;
}
