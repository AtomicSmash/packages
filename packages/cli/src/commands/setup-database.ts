import { exec } from "node:child_process";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import {
	hasHelpFlag,
	convertMeasureToPrettyString,
	startRunningMessage,
} from "../utils.js";

export const setupHelpMessage = `
  Atomic Smash CLI - Setup database command.

  Create a new database and initialise the site with no content.

  Example usage:
    $ smash-cli setup-database
`;

export default async function setupDatabase(args: string[]) {
	if (hasHelpFlag(args)) {
		console.log(setupHelpMessage);
		return;
	}
	const execute = promisify(exec);
	const themeName = process.env.npm_package_config_theme_name;
	const addCustomUser =
		process.env.WORDPRESS_USER &&
		process.env.WORDPRESS_USER_EMAIL &&
		process.env.WORDPRESS_PASSWORD;

	if (!themeName) {
		throw new Error("Theme name is missing from package.json config object.");
	} else {
		const interval = startRunningMessage("Initialising database");
		performance.mark("Start");
		await execute("wp db create")
			.then(() => {
				return execute(
					`wp core install --url=http://${process.env.CI ? "127.0.0.1" : `${themeName}.test`}/ --title=Temp --admin_user=Bot --admin_email=fake@fake.com --admin_password=password`,
				);
			})
			.then(() => {
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
					console.log(
						`Wordpress database tables installed. (${convertMeasureToPrettyString(
							performance.measure("add-custom-user", "wordpress-tables"),
						)})`,
					);
				}
				return execute(
					`wp plugin activate --all --exclude=wordfence,shortpixel-image-optimiser`,
				);
			})
			.then(() => {
				console.log(
					`Plugins activated. (${convertMeasureToPrettyString(
						performance.measure(
							"plugins",
							addCustomUser ? "add-custom-user" : "wordpress-tables",
						),
					)})`,
				);
				console.log("Activating theme...");
				return execute(`wp theme activate host-students`);
			})
			.then(() => {
				console.log(
					`Theme activated. (${convertMeasureToPrettyString(
						performance.measure("theme", "plugins"),
					)})`,
				);
				if (interval !== null) {
					clearInterval(interval);
				}
				console.log(
					`Database set up${addCustomUser ? ` and ${process.env.WORDPRESS_USER} user added` : !process.env.CI ? ". To set up a user, run the `wp user create` command." : ""}. (${convertMeasureToPrettyString(
						performance.measure("everything", "Start"),
					)})`,
				);
			})
			.catch((error: { stderr: string }) => {
				if (interval !== null) {
					clearInterval(interval);
				}
				if (error.stderr.startsWith("ERROR 1007")) {
					console.error(
						"Database already exists with the name in the wp-config. Please delete that database first with `wp db drop --yes`",
					);
				} else {
					console.error(error);
				}
			});
	}
}
