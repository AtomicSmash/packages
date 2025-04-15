import { test as setup } from "@playwright/test";
import { storageState } from "./index.js";

setup("Login as admin", async ({ page }) => {
	await page.goto("/wp/wp-admin/");

	await page
		.getByLabel("Username or Email Address", { exact: true })
		.fill("Bot");
	await page.getByLabel("Password", { exact: true }).fill("password");

	await page.getByRole("button", { name: "Log In", exact: true }).click();

	await page.waitForURL("/wp/wp-admin/");

	await page.context().storageState({ path: storageState });
});
