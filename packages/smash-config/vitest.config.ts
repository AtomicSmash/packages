import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		include: ["src/tests/**/*.test.{js,mjs,cjs,ts,jsx,tsx}"],
	},
});
