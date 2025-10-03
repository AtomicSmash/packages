import { exec } from "node:child_process";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import {
	convertMeasureToPrettyString,
	getSmashConfig,
	startRunningMessage,
} from "../utils.js";
import "dotenv/config";

export const command = "setup-database";
export const describe =
	"Create a new database and initialise the site with no content.";
export async function handler() {
	const execute = promisify(exec);
	const smashConfig = await getSmashConfig();
	// These must remain env vars because they differ for each dev.
	const addCustomUser =
		process.env.WORDPRESS_USER &&
		process.env.WORDPRESS_USER_EMAIL &&
		process.env.WORDPRESS_PASSWORD;

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
				if (addCustomUser) {
					return execute(
						`wp user create ${process.env.WORDPRESS_USER} ${process.env.WORDPRESS_USER_EMAIL} --user_pass=${process.env.WORDPRESS_PASSWORD} --role=administrator`,
					);
				}
			})
			.then(() => {
				if (addCustomUser) {
					performance.mark("add-custom-user");
					console.log(
						`Custom user ${process.env.WORDPRESS_USER} added. (${convertMeasureToPrettyString(
							performance.measure("add-custom-user", "wordpress-tables"),
						)})`,
					);
				}
				return execute(
					`wp plugin activate --all --exclude=wordfence,shortpixel-image-optimiser`,
				);
			})
			.then(() => {
				performance.mark("plugins");
				console.log(
					`Plugins activated. (${convertMeasureToPrettyString(
						performance.measure(
							"plugins",
							addCustomUser ? "add-custom-user" : "wordpress-tables",
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
					`Database set up${addCustomUser ? ` and ${process.env.WORDPRESS_USER} user added` : !process.env.CI ? ". To set up a user, run the `wp user create` command." : ""}. (${convertMeasureToPrettyString(
						performance.measure("everything", "Start"),
					)})`,
				);
			})
			.catch(async (error: { stderr: string }) => {
				await stopRunningMessage();
				if (error.stderr?.startsWith("ERROR 1007")) {
					console.error(
						"Database already exists with the name in the wp-config. Please delete that database first with `wp db drop --yes`",
					);
				} else {
					console.error(error);
				}
			});
	}
}
