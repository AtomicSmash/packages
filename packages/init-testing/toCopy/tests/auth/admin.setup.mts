import { test as setup } from "@playwright/test";
import { storageState } from "./index.mjs";

setup("Login as admin", async ({ page }) => {
	await page.goto("/wp/wp-admin/");

	await page
		.getByLabel("Username or Email Address", { exact: true })
		.fill(process.env.WORDPRESS_AUTOMATION_USER ?? "Bot");
	await page
		.getByLabel("Password", { exact: true })
		.fill(process.env.WORDPRESS_AUTOMATION_PASSWORD ?? "password");

	await page.getByRole("button", { name: "Log In", exact: true }).click();

	await page.waitForURL("/wp/wp-admin/");

	await page.context().storageState({ path: storageState });
});
