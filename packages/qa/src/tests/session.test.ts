import { expect, test } from "vitest";
import { toPlaywrightCookies, wpCommand } from "../session";

const staging = (overrides: { port?: number; webRoot?: string } = {}) => ({
	staging: {
		url: "staging.example.com",
		webRoot: overrides.webRoot ?? "/www/site/public",
		dbPrefix: "wp_",
		uploadsPath: "wp-content/uploads",
		ssh: { username: "deploy", host: "1.2.3.4", port: overrides.port },
	},
});

const sshOptions = [
	"-o",
	"BatchMode=yes",
	"-o",
	"StrictHostKeyChecking=accept-new",
];

test("runs WP-CLI directly on local", () => {
	expect(wpCommand("local", staging(), ["eval-file", "-"])).toEqual({
		command: "wp",
		args: ["eval-file", "-"],
	});
});

test("runs WP-CLI over SSH in the web root on staging", () => {
	expect(
		wpCommand("staging", staging(), ["eval-file", "-", "customer"]),
	).toEqual({
		command: "ssh",
		args: [
			...sshOptions,
			"deploy@1.2.3.4",
			"cd /www/site/public && wp eval-file - customer",
		],
	});
});

test("passes the SSH port and skips cd without a web root", () => {
	expect(
		wpCommand("staging", staging({ port: 22022, webRoot: "" }), [
			"cli",
			"info",
		]),
	).toEqual({
		command: "ssh",
		args: [...sshOptions, "-p", "22022", "deploy@1.2.3.4", "wp cli info"],
	});
});

const session = {
	expires: 1_900_000_000,
	cookies: [
		{ name: "wordpress_logged_in_abc", value: "li", paths: ["/", "/"] },
		{
			name: "wordpress_sec_abc",
			value: "sa",
			paths: ["/wp-admin", "/wp-content/plugins"],
		},
	],
};

test("sets domain and secure flag from the base URL, one cookie per distinct path", () => {
	expect(toPlaywrightCookies(session, "https://site.test")).toEqual([
		expect.objectContaining({
			name: "wordpress_logged_in_abc",
			value: "li",
			domain: "site.test",
			path: "/",
			expires: 1_900_000_000,
			secure: true,
			httpOnly: true,
		}),
		expect.objectContaining({ name: "wordpress_sec_abc", path: "/wp-admin" }),
		expect.objectContaining({
			name: "wordpress_sec_abc",
			path: "/wp-content/plugins",
		}),
	]);
});

test("marks cookies insecure on http and defaults an empty path to /", () => {
	expect(
		toPlaywrightCookies(
			{ expires: 1, cookies: [{ name: "c", value: "v", paths: [""] }] },
			"http://staging.example.com",
		),
	).toEqual([
		expect.objectContaining({
			domain: "staging.example.com",
			path: "/",
			secure: false,
		}),
	]);
});
