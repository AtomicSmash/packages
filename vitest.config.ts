import { readFileSync } from "node:fs";
import os from "node:os";
import { defineConfig } from "vitest/config";
import "dotenv/config";

const userHomeDir = os.homedir();

export default defineConfig({
	server: {
		https:
			process.env.VITE_USE_HTTPS === "true"
				? {
						cert: readFileSync(
							process.env.LOCALHOST_TLS_CERT_FILE ??
								`${userHomeDir}/.certs/cert.pem`,
						),
						key: readFileSync(
							process.env.LOCALHOST_TLS_KEY_FILE ??
								`${userHomeDir}/.certs/key.pem`,
						),
					}
				: undefined,
		watch: {
			ignored: [
				"**/node_modules/**",
				"**/dist/**",
				`./packages/init-testing/src/tests/package.json`,
				`./packages/init-testing/src/tests/package-lock.json`,
			],
		},
	},
	test: {
		forceRerunTriggers: [
			"package.json",
			"packages/*/package.json",
			"**/vitest.config.*/**",
			"**/vite.config.*/**",
		],
		projects: ["packages/*/vitest.config.ts"],
	},
});
