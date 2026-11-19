import { defineQaConfig } from "@atomicsmash/qa";
import homepage from "./journeys/homepage.journey.ts";

export default defineQaConfig({
	/**
	 * The journeys `smash-qa run` runs. Comment a line out to skip that file's journeys.
	 */
	journeys: [homepage],

	/**
	 * Per-environment test data, referenced in journeys with data("key").
	 * Purchase journeys must point at test products, never real stock.
	 */
	data: {
		local: {
			// product: "/product/qa-test-product/",
		},
		staging: {
			// product: "/product/qa-test-product/",
		},
	},
});
