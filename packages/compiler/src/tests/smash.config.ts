import type { SmashConfig } from "../../../smash-config";
export default {
	projectName: "compiler-tests",
	themePath: "theme",
	staging: {
		url: "compiler.test",
		webRoot: "/test/",
		ssh: {
			username: "test",
			host: "000.000.000.000",
		},
	},
} satisfies SmashConfig;
