import type { Environment, SessionCookie } from "./types.js";
import type { SmashConfigV2Resolved } from "@atomicsmash/smash-config";
import { spawn } from "node:child_process";

/** How long minted login cookies stay valid, in seconds. */
export const SESSION_TTL_SECONDS = 2 * 60 * 60;

/** Roles are passed to a remote shell, so only plain WordPress role slugs are accepted. */
const ROLE_PATTERN = /^[a-z0-9_-]+$/i;

/** Prefixes the session JSON so it can be found among notices that plugins print to stdout. */
const SESSION_MARKER = "SMASH_QA_SESSION:";

/**
 * PHP run through `wp eval-file -` that finds or creates the `smash-qa-<role>` user and prints
 * login cookies for a new session. It never sets or reveals a usable password.
 */
export const SESSION_PHP = `<?php
[ $role, $ttl, $secure ] = $args;
if ( ! get_role( $role ) ) {
	WP_CLI::error( "The \\"$role\\" role doesn't exist on this site." );
}
$login = "smash-qa-$role";
$user  = get_user_by( 'login', $login );
$id    = $user ? $user->ID : wp_insert_user( [
	'user_login'   => $login,
	'user_pass'    => wp_generate_password( 64, true, true ),
	'user_email'   => "$login@example.invalid",
	'display_name' => "Smash QA ($role)",
	'role'         => $role,
] );
if ( is_wp_error( $id ) ) {
	WP_CLI::error( $id );
}
if ( $user && ! in_array( $role, $user->roles, true ) ) {
	$user->set_role( $role );
}
$secure  = '1' === $secure;
$expires = time() + (int) $ttl;
$token   = WP_Session_Tokens::get_instance( $id )->create( $expires );
echo PHP_EOL . '${SESSION_MARKER}' . wp_json_encode( [
	'expires' => $expires,
	'cookies' => [
		[
			'name'  => LOGGED_IN_COOKIE,
			'value' => wp_generate_auth_cookie( $id, $expires, 'logged_in', $token ),
			'paths' => [ COOKIEPATH, SITECOOKIEPATH ],
		],
		[
			'name'  => $secure ? SECURE_AUTH_COOKIE : AUTH_COOKIE,
			'value' => wp_generate_auth_cookie( $id, $expires, $secure ? 'secure_auth' : 'auth', $token ),
			'paths' => [ ADMIN_COOKIE_PATH, PLUGINS_COOKIE_PATH ],
		],
	],
] ) . PHP_EOL;
`;

/** The session WordPress hands back: cookie values and the paths each is set on. */
export type RawSession = {
	expires: number;
	cookies: { name: string; value: string; paths: string[] }[];
};

/**
 * Pull the session out of WP-CLI's stdout, ignoring any PHP notices or plugin output around it.
 */
export function parseSession(stdout: string): RawSession {
	const json = stdout
		.split("\n")
		.reverse()
		.find((line) => line.startsWith(SESSION_MARKER))
		?.slice(SESSION_MARKER.length);
	if (!json) {
		throw new Error("WP-CLI didn't return a session.");
	}
	return JSON.parse(json) as RawSession;
}

/**
 * Build the command that runs WP-CLI for an environment: directly on local, over SSH on staging.
 */
export function wpCommand(
	env: Environment,
	config: Pick<SmashConfigV2Resolved, "staging">,
	wpArgs: string[],
): { command: string; args: string[] } {
	if (env === "local") {
		return { command: "wp", args: wpArgs };
	}
	const { ssh, webRoot } = config.staging;
	return {
		command: "ssh",
		args: [
			"-o",
			"BatchMode=yes",
			"-o",
			"StrictHostKeyChecking=accept-new",
			...(ssh.port ? ["-p", ssh.port.toString()] : []),
			`${ssh.username}@${ssh.host}`,
			`${webRoot ? `cd ${webRoot} && ` : ""}wp ${wpArgs.join(" ")}`,
		],
	};
}

/**
 * Turn WordPress's session into Playwright cookies for the site under test. The domain and
 * `secure` flag come from the run's base URL, so a pulled database with another siteurl still works.
 */
export function toPlaywrightCookies(
	session: RawSession,
	baseURL: string,
): SessionCookie[] {
	const { hostname, protocol } = new URL(baseURL);
	return session.cookies.flatMap(({ name, value, paths }) =>
		[
			...new Set(
				paths.map((path) => path || "/").filter((path) => path.startsWith("/")),
			),
		].map((path) => ({
			name,
			value,
			domain: hostname,
			path,
			expires: session.expires,
			httpOnly: true,
			secure: protocol === "https:",
			sameSite: "Lax" as const,
		})),
	);
}

/**
 * Run a command with the given stdin, resolving with stdout or rejecting with stderr.
 */
function run(command: string, args: string[], input: string) {
	return new Promise<string>((done, fail) => {
		const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
		const output = { stdout: "", stderr: "" };
		child.stdout
			.setEncoding("utf8")
			.on("data", (chunk: string) => (output.stdout += chunk));
		child.stderr
			.setEncoding("utf8")
			.on("data", (chunk: string) => (output.stderr += chunk));
		child.on("error", fail).on("close", (code) => {
			if (code === 0) {
				done(output.stdout);
				return;
			}
			fail(
				new Error(
					output.stderr.trim() || `${command} exited with ${String(code)}`,
				),
			);
		});
		child.stdin.end(input);
	});
}

/**
 * Log in as each role on an environment via WP-CLI, returning the cookies per role.
 */
export async function createSessions(
	env: Environment,
	roles: string[],
	config: Pick<SmashConfigV2Resolved, "staging">,
	baseURL: string,
): Promise<Record<string, SessionCookie[]>> {
	const secure = new URL(baseURL).protocol === "https:" ? "1" : "0";
	const sessions = await Promise.all(
		[...new Set(roles)].map(async (role) => {
			try {
				if (!ROLE_PATTERN.test(role)) {
					throw new Error("Roles may only contain letters, numbers, - and _.");
				}
				const { command, args } = wpCommand(env, config, [
					`--url=${baseURL}`,
					"eval-file",
					"-",
					role,
					SESSION_TTL_SECONDS.toString(),
					secure,
				]);
				const session = parseSession(await run(command, args, SESSION_PHP));
				return [role, toPlaywrightCookies(session, baseURL)] as const;
			} catch (error) {
				throw new Error(
					`Couldn't log in as "${role}" on ${env}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}),
	);
	return Object.fromEntries(sessions);
}
