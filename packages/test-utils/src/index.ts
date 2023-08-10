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

export const playwrightProjectsConfig: PlaywrightTestConfig["projects"] = [
	{
		name: "chromium",
		use: { ...devices["Desktop Chrome"] },
		grepInvert: /@mobile @lighthouse/,
	},
	{
		name: "firefox",
		use: { ...devices["Desktop Firefox"] },
		grepInvert: /@lighthouse/,
	},
	{
		name: "webkit",
		use: { ...devices["Desktop Safari"] },
		grepInvert: /@lighthouse/,
	},
	/* Test against mobile viewports. */
	{
		name: "Mobile Chrome",
		use: { ...devices["Pixel 5"] },
		grepInvert: /@desktop @lighthouse/,
	},
	{
		name: "Mobile Safari",
		use: { ...devices["iPhone 12"] },
		grepInvert: /@lighthouse/,
	},
];

export const getLighthouseTest = (logInUser: AuthenticatePageFunction) => {
	const lighthouseTest = base.extend<
		{ authenticatedPage: Page; context: BrowserContext },
		{ port: number }
	>({
		port: [
			// eslint-disable-next-line no-empty-pattern
			async ({}, use) => {
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
>[1];

export const doLighthouseTest: (
	pageToTest: PageList[number],
	type: "desktop" | "mobile",
) => LighthouseTestFunction = (pageToTest, type) =>
	async function ({ port, authenticatedPage }) {
		await authenticatedPage.goto(pageToTest.url);
		await playAudit({
			page: authenticatedPage,
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
	builder = new AxeBuilder({ page });
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

function slugify(stringToSlugify: string) {
	// REGEX_1: Match any character that isn't alphanumeric, underscore, whitespace and underscore
	// REGEX_2: Match any character that is underscore, whitespace and underscore
	// REGEX_3: Match any hyphens at the start or the end of the string
	return stringToSlugify
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
