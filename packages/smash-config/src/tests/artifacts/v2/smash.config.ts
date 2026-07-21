import type { SmashConfig } from "../../../types";
export default {
	version: 2,
	projectName: "smash-config-tests",
	themePath: "theme",
	staging: {
		url: "smash-config.test",
		webRoot: "/test/",
		ssh: {
			username: "test",
			host: "000.000.000.000",
		},
	},
} satisfies SmashConfig;
