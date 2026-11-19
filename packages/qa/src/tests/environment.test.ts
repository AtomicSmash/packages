import { expect, test } from "vitest";
import { resolveEnvironment } from "../environment";

const config = {
	local: { url: "https://site.test" },
	staging: {
		url: "staging.example.com",
		webRoot: "/www",
		dbPrefix: "wp_",
		uploadsPath: "public/wp-content/uploads",
		ssh: { username: "u", host: "h" },
		httpAuth: { username: "user", password: "pass" },
	},
};

test("resolveEnvironment()", () => {
	expect(resolveEnvironment("local", config)).toEqual({
		baseURL: "https://site.test",
	});
	expect(resolveEnvironment("staging", config)).toEqual({
		baseURL: "https://staging.example.com",
		httpCredentials: { username: "user", password: "pass" },
	});
});
