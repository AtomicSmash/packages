/**
 * Normalise a local site URL to an absolute origin with a protocol and no trailing slash.
 * Unlike staging URLs, the protocol is kept because local sites may be served over http.
 */
export function normaliseLocalURL(localURL: string): string {
	const withoutTrailingSlash = localURL.replace(/\/+$/, "");
	return /^https?:\/\//.test(withoutTrailingSlash)
		? withoutTrailingSlash
		: `https://${withoutTrailingSlash.replace(/^\/\//, "")}`;
}
