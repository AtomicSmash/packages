import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		include: ["src/**/*.test.{js,mjs,cjs,ts,jsx,tsx}"],
		environment: "happy-dom",
		globals: true,
		setupFiles: ["./test-setup.ts"],
	},
});
