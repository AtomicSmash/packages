import { readFileSync } from "node:fs";
import os from "node:os";
import { defineProject } from "vitest/config";
import dotenv from "dotenv";
dotenv.config({
	path: "../../.env",
});
const userHomeDir = os.homedir();

export default defineProject({
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
	},
	test: {
		include: ["src/**/*.test.{js,mjs,cjs,ts,jsx,tsx}"],
		environment: "happy-dom",
		globals: true,
		setupFiles: ["./test-setup.ts"],
	},
});
