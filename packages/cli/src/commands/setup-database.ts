import { exec } from "node:child_process";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import { getSmashConfig } from "@atomicsmash/smash-config";
import { convertMeasureToPrettyString, startRunningMessage } from "../utils.js";
import "dotenv/config";

function extractDependenciesFromError(errorMessage: string): string[] {
	// Extract plugin names from error messages like:
	// "Warning: Failed to activate plugin. Discount Rules for WooCommerce requires 1 plugin to be installed and activated: WooCommerce."
	const regex = /requires \d+ plugin[s]? to be installed and activated: (.+)\./;
	const match = regex.exec(errorMessage);
	if (match?.[1]) {
		return match[1].split(",").map((dep) => dep.trim());
	}
	return [];
}

async function activatePluginsWithRetry(
	execute: (command: string) => Promise<{ stdout: string; stderr: string }>,
	pluginsToActivate: string[],
	excludedPlugins: string[],
): Promise<void> {
	const maxRetries = 10; // Prevent infinite loops
	let retryCount = 0;
	const remainingPlugins = [...pluginsToActivate];

	while (remainingPlugins.length > 0 && retryCount < maxRetries) {
		const pluginsToTry = [...remainingPlugins];
		remainingPlugins.length = 0; // Clear the array

		for (const pluginName of pluginsToTry) {
			if (excludedPlugins.includes(pluginName)) {
				continue;
			}

			try {
				await execute(`wp plugin activate ${pluginName}`);
				console.log(`✓ Activated ${pluginName}`);
			} catch (error: unknown) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);

				// Check if this is a dependency error
				const dependencies = extractDependenciesFromError(errorMessage);

				if (dependencies.length > 0) {
					console.log(
						`⚠ ${pluginName} requires dependencies: ${dependencies.join(", ")}`,
					);

					// Add dependencies to the remaining plugins list if they're not already there
					for (const dep of dependencies) {
						if (
							!pluginsToActivate.includes(dep) &&
							!excludedPlugins.includes(dep)
						) {
							pluginsToActivate.push(dep);
						}
						if (!remainingPlugins.includes(dep)) {
							remainingPlugins.push(dep);
						}
					}

					// Add the current plugin back to try again later
					remainingPlugins.push(pluginName);
				} else {
					console.warn(
						`⚠ Warning: Could not activate ${pluginName}: ${errorMessage}`,
					);
				}
			}
		}

		retryCount++;
	}

	if (remainingPlugins.length > 0) {
		console.warn(
			`⚠ Warning: Could not activate all plugins after ${maxRetries.toString()} attempts. Remaining: ${remainingPlugins.join(", ")}`,
		);
	}
}

export const command = "setup-database";
export const describe =
	"Create a new database and initialise the site with no content.";
export async function handler() {
	const execute = promisify(exec);
	const smashConfig = await getSmashConfig();
	// These must remain env vars because they differ for each dev.
	const newUserToAdd =
		process.env.WORDPRESS_USER &&
		process.env.WORDPRESS_USER_EMAIL &&
		process.env.WORDPRESS_PASSWORD
			? {
					user: process.env.WORDPRESS_USER,
					email: process.env.WORDPRESS_USER_EMAIL,
					password: process.env.WORDPRESS_PASSWORD,
				}
			: null;

	if (!smashConfig) {
		throw new Error(
			"Unable to determine project setup information. Please add a smash.config.ts file with the required info.",
		);
	} else {
		const { projectName, themeFolderName } = smashConfig;
		const stopRunningMessage = startRunningMessage("Initialising database");
		performance.mark("Start");
		await execute("wp db create")
			.then(() => {
				return execute(
					`wp core install --url=http://${process.env.CI ? "127.0.0.1" : `${projectName}.test`}/ --title=Temp --admin_user=Bot --admin_email=fake@fake.com --admin_password=password`,
				);
			})
			.then(() => {
				performance.mark("wordpress-tables");
				console.log(
					`Wordpress database tables installed. (${convertMeasureToPrettyString(
						performance.measure("wordpress-tables", "Start"),
					)})`,
				);
				if (newUserToAdd) {
					return execute(
						`wp user create ${newUserToAdd.user} ${newUserToAdd.email} --user_pass=${newUserToAdd.password} --role=administrator`,
					);
				}
			})
			.then(async () => {
				if (newUserToAdd) {
					performance.mark("add-custom-user");
					console.log(
						`Custom user ${newUserToAdd.user} added. (${convertMeasureToPrettyString(
							performance.measure("add-custom-user", "wordpress-tables"),
						)})`,
					);
				}

				const excludedPlugins = [
					"stream",
					"shortpixel-image-optimiser",
					"wordfence",
					"wp-mail-smtp",
					"modular-connector",
				];
				const { stdout: pluginList } = await execute(
					"wp plugin list --format=json",
				);
				const allPlugins: { name: string; status: string }[] = JSON.parse(
					pluginList,
				) as { name: string; status: string }[];

				// Filter out excluded plugins and already active plugins
				const pluginsToActivate = allPlugins
					.filter(
						(plugin) =>
							!excludedPlugins.includes(plugin.name) &&
							plugin.status !== "active",
					)
					.map((plugin) => plugin.name);

				await activatePluginsWithRetry(
					execute,
					pluginsToActivate,
					excludedPlugins,
				);
			})
			.then(() => {
				performance.mark("plugins");
				console.log(
					`Plugins activated. (${convertMeasureToPrettyString(
						performance.measure(
							"plugins",
							newUserToAdd ? "add-custom-user" : "wordpress-tables",
						),
					)})`,
				);
				return execute(`wp theme activate ${themeFolderName}`);
			})
			.then(async () => {
				performance.mark("theme");
				console.log(
					`Theme activated. (${convertMeasureToPrettyString(
						performance.measure("theme", "plugins"),
					)})`,
				);
				await stopRunningMessage();
				console.log(
					`Database set up${newUserToAdd ? ` and ${newUserToAdd.user} user added` : !process.env.CI ? ". To set up a user, run the `wp user create` command." : ""}. (${convertMeasureToPrettyString(
						performance.measure("everything", "Start"),
					)})`,
				);
			})
			.catch(async (error: unknown) => {
				await stopRunningMessage();
				if (
					typeof error === "object" &&
					error &&
					"stderr" in error &&
					typeof error.stderr === "string" &&
					error.stderr.startsWith("ERROR 1007")
				) {
					console.error(
						"Database already exists with the name in the wp-config. Please delete that database first with `wp db drop --yes`",
					);
				} else {
					console.error(error);
					process.exitCode = 1;
				}
			});
	}
}
