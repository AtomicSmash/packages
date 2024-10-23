import type {
	Page,
	BrowserContext,
	PlaywrightTestConfig,
} from "@playwright/test";
import type { SerialFrameSelector } from "axe-core";
import type { Config } from "lighthouse";
import os from "node:os";
import path from "node:path";
import { AxeBuilder } from "@axe-core/playwright";
import { test as base, chromium, devices } from "@playwright/test";
import getPort from "get-port";
import lighthouseDesktopConfig from "lighthouse/core/config/lr-desktop-config.js";
import lighthouseMobileConfig from "lighthouse/core/config/lr-mobile-config.js";
import { playAudit } from "playwright-lighthouse";

const { expect } = base;

export type PageList = {
	url: string;
	name: string;
	slug?: string;
	restrictedAccess?: boolean;
}[];

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
	reporter: "dot",
	use: {
		actionTimeout: 0,
		trace: "on-first-retry",
	},
} satisfies PlaywrightTestConfig;

export const getLighthouseTest = (logInUser: AuthenticatePageFunction) => {
	const lighthouseTest = base.extend<
		{ authenticatedPage: Page; context: BrowserContext },
		{ port: number }
	>({
		port: [
			async (_unused, use) => {
				// Assign a unique port for each playwright worker to support parallel tests
				const port = await getPort();
				await use(port);
			},
			{ scope: "worker" },
		],
		context: [
			async ({ port }, use) => {
				const userDataDir = path.join(os.tmpdir(), "pw", String(Math.random()));
				const context = await chromium.launchPersistentContext(userDataDir, {
					args: [`--remote-debugging-port=${port}`],
				});
				await use(context);
				await context.close();
			},
			{ scope: "test" },
		],
		authenticatedPage: [logInUser, { scope: "test" }],
	});
	lighthouseTest.describe.configure({ mode: "parallel", retries: 3 });

	return lighthouseTest;
};

type LighthouseTestFunction = Parameters<
	ReturnType<typeof getLighthouseTest>
>[2];

export const doLighthouseTest: (
	pageToTest: PageList[number],
	type: "desktop" | "mobile",
	disableAuditLogs?: boolean,
) => LighthouseTestFunction = (pageToTest, type, disableAuditLogs = false) =>
	async function ({ port, authenticatedPage }) {
		await authenticatedPage.goto(pageToTest.url);
		await playAudit({
			// TODO: Wait for playwright-lighthouse to update dependency constraint, then remove this "as" declaration.
			page: authenticatedPage as Parameters<typeof playAudit>[0]["page"],
			thresholds: {
				performance: 85,
				accessibility: 85,
				"best-practices": 85,
				seo: 85,
			},
			port: port,
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
		await authenticatedPage.goto(
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
		for (const pageToTest of pagesToTest.filter(
			(page) => page.restrictedAccess,
		)) {
			const response = await page.goto(pageToTest.url);
			expect(response).not.toBeNull();
			const nonNullResponse = response as NonNullable<typeof response>;
			expect(nonNullResponse.status()).toBe(401);
		}
	};
export const checkForLoremIpsum =
	(pagesToTest: PageList) =>
	async ({ authenticatedPage }: { authenticatedPage: Page }) => {
		for (const pageToTest of pagesToTest) {
			await authenticatedPage.goto(pageToTest.url);
			await expect(authenticatedPage.getByText("Lorem ipsum")).not.toBeAttached(
				{
					timeout: 100,
				},
			);
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
			].filter((value) => value !== undefined) as RegExp[],
		});
	}
	return projects;
}
