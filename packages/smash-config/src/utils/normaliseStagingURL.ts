export function normaliseStagingURL(stagingURL: string): string {
	return stagingURL
		.replace(/^https?:\/\//, "")
		.replace(/^\/\//, "")
		.replace(/\/$/, "");
}
