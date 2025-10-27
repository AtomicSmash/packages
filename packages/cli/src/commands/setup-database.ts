import { exec } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import {
	convertMeasureToPrettyString,
	getSmashConfig,
	startRunningMessage,
} from "../utils.js";
import "dotenv/config";

function parsePluginHeaders(pluginPath: string): Record<string, string> | null {
	try {
		// Find the main plugin file by looking for the standard WordPress plugin header
		const files = readdirSync(pluginPath).filter(file => file.endsWith('.php'));
		let mainFile: string | null = null;

		// Look for the file containing the standard plugin header
		for (const file of files) {
			const content = readFileSync(join(pluginPath, file), 'utf8');
			// Check for the standard plugin header (Plugin Name: field)
			if (/^\s*\/\*\*[\s\S]*?Plugin Name:/m.test(content)) {
				mainFile = file;
				break;
			}
		}

		if (!mainFile) return null;

		const content = readFileSync(join(pluginPath, mainFile), 'utf8');

		// Match the plugin header block
		const headerPattern = /\/\*\*\s*([\s\S]*?)\s*\*\//;
		const match = headerPattern.exec(content);

		if (!match) return null;

		const headers: Record<string, string> = {};
		const headerContent = match[1];

		// Parse each header line
		headerContent?.split('\n').forEach(line => {
			const colonIndex = line.indexOf(':');
			if (colonIndex > 0) {
				const key = line.substring(0, colonIndex).trim().replace(/\*/g, '');
				const value = line.substring(colonIndex + 1).trim();
				if (key && value) {
					headers[key] = value;
				}
			}
		});

		return headers;
	} catch (_error) {
		return null;
	}
}

async function buildDependencyGraph(execute: (command: string) => Promise<{ stdout: string; stderr: string }>) {
	const graph = new Map<string, string[]>();
	const pluginPaths = new Map<string, string>();

	// Get the plugins directory path
	const { stdout: pluginsDir } = await execute('wp plugin path');
	const pluginsDirectory = pluginsDir.trim();

	// Get all plugins
	const { stdout: pluginList } = await execute('wp plugin list --format=json');
	const plugins: { name: string }[] = JSON.parse(pluginList) as { name: string }[];

	// Map plugin names to their paths
	for (const plugin of plugins) {
		const pluginPath = `${pluginsDirectory}/${plugin.name}`;
    pluginPaths.set(plugin.name, pluginPath);
	}

	// Parse headers and build dependency graph
	for (const [pluginName, pluginPath] of pluginPaths) {
		const headers = parsePluginHeaders(pluginPath);
		if (headers?.['Requires Plugins']) {
			// Parse the Requires Plugins field (comma-separated list)
			const dependencies = headers['Requires Plugins']
				.split(',')
				.map(dep => dep.trim())
				.filter(dep => dep.length > 0);

			graph.set(pluginName, dependencies);
		} else {
			graph.set(pluginName, []);
		}
	}

	return graph;
}

function topologicalSort(graph: Map<string, string[]>): string[] {
	const visited = new Set<string>();
	const temp = new Set<string>();
	const result: string[] = [];

	function visit(node: string) {
		if (temp.has(node)) {
			throw new Error(`Circular dependency detected involving ${node}`);
		}
		if (visited.has(node)) {
			return;
		}

		temp.add(node);

		// Visit all dependencies first
		const dependencies = graph.get(node) ?? [];
		for (const dep of dependencies) {
			if (graph.has(dep)) {
				visit(dep);
			}
		}

		temp.delete(node);
		visited.add(node);
		result.push(node);
	}

	// Visit all nodes
	for (const node of graph.keys()) {
		if (!visited.has(node)) {
			visit(node);
		}
	}

	return result;
}

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
			.then(async () => {
				if (addCustomUser) {
					performance.mark("add-custom-user");
					console.log(
						`Custom user ${process.env.WORDPRESS_USER} added. (${convertMeasureToPrettyString(
							performance.measure("add-custom-user", "wordpress-tables"),
						)})`,
					);
				}

				performance.mark("plugins");
				const dependencyGraph = await buildDependencyGraph(execute);

				const excludedPlugins = ['stream', 'shortpixel-image-optimiser', 'wordfence'];
			const { stdout: pluginList } = await execute('wp plugin list --format=json');
			const allPlugins: { name: string; status: string }[] = JSON.parse(pluginList) as { name: string; status: string }[];

			// Filter out excluded plugins and already active plugins
			const pluginsToActivate = allPlugins.filter(plugin =>
				!excludedPlugins.includes(plugin.name) &&
				plugin.status !== 'active'
			);

			const filteredGraph = new Map<string, string[]>();
			for (const plugin of pluginsToActivate) {
				const dependencies = dependencyGraph.get(plugin.name) ?? [];
				// Only include dependencies that are also in our activation list
				const filteredDependencies = dependencies.filter(dep =>
					pluginsToActivate.some(p => p.name === dep)
				);
				filteredGraph.set(plugin.name, filteredDependencies);
			}

				const activationOrder = topologicalSort(filteredGraph);

				for (const pluginName of activationOrder) {
					try {
						await execute(`wp plugin activate ${pluginName}`);
						console.log(`✓ Activated ${pluginName}`);
					} catch (error: unknown) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						console.warn(`⚠ Warning: Could not activate ${pluginName}: ${errorMessage}`);
					}
				}
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
					process.exitCode = 1;
				}
			});
	}
}
