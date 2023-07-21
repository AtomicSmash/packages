type StatusCodeObject = {
	statusCode: number;
	statusMessage: string;
	docs: string;
};
export const informationResponses = [
	{
		statusCode: 100,
		statusMessage: "Continue",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/100",
	},
	{
		statusCode: 101,
		statusMessage: "Switching Protocols",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/101",
	},
	{
		statusCode: 102,
		statusMessage: "Processing",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/102",
	},
	{
		statusCode: 103,
		statusMessage: "Early Hints",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/103",
	},
] as const satisfies ReadonlyArray<StatusCodeObject>;
export const informationResponseCodes = informationResponses.map(
	(code) => code.statusCode,
);
export type InformationResponseCodes =
	(typeof informationResponseCodes)[number];
export function isInformationResponseCode(
	code:
		| InformationResponseCodes
		| SuccessfulResponseCodes
		| RedirectionResponseCodes
		| ClientErrorResponseCodes
		| ServerErrorResponseCodes,
): code is InformationResponseCodes {
	if (informationResponseCodes.includes(code as InformationResponseCodes)) {
		return true;
	}
	return false;
}

export const successfulResponses = [
	{
		statusCode: 200,
		statusMessage: "OK",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/200",
	},
	{
		statusCode: 201,
		statusMessage: "Created",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/201",
	},
	{
		statusCode: 202,
		statusMessage: "Accepted",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/202",
	},
	{
		statusCode: 203,
		statusMessage: "Non-Authoritative Information",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/203",
	},
	{
		statusCode: 204,
		statusMessage: "No Content",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/204",
	},
	{
		statusCode: 205,
		statusMessage: "Reset Content",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/205",
	},
	{
		statusCode: 206,
		statusMessage: "Partial Content",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/206",
	},
	{
		statusCode: 207,
		statusMessage: "Multi-Status",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/207",
	},
	{
		statusCode: 208,
		statusMessage: "Already Reported",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/208",
	},
	{
		statusCode: 226,
		statusMessage: "IM Used",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/226",
	},
] as const satisfies ReadonlyArray<StatusCodeObject>;
export const successfulResponseCodes = successfulResponses.map(
	(code) => code.statusCode,
);
export type SuccessfulResponseCodes = (typeof successfulResponseCodes)[number];
export function isSuccessfulResponseCode(
	code:
		| InformationResponseCodes
		| SuccessfulResponseCodes
		| RedirectionResponseCodes
		| ClientErrorResponseCodes
		| ServerErrorResponseCodes,
): code is SuccessfulResponseCodes {
	if (successfulResponseCodes.includes(code as SuccessfulResponseCodes)) {
		return true;
	}
	return false;
}

export const redirectionResponses = [
	{
		statusCode: 300,
		statusMessage: "Multiple Choices",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/300",
	},
	{
		statusCode: 301,
		statusMessage: "Moved Permanently",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/301",
	},
	{
		statusCode: 302,
		statusMessage: "Found",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/302",
	},
	{
		statusCode: 303,
		statusMessage: "See Other",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/303",
	},
	{
		statusCode: 304,
		statusMessage: "Not Modified",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/304",
	},
	{
		statusCode: 305,
		statusMessage: "Use Proxy",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/305",
	},
	{
		statusCode: 306,
		statusMessage: "unused",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/306",
	},
	{
		statusCode: 307,
		statusMessage: "Temporary Redirect",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/307",
	},
	{
		statusCode: 308,
		statusMessage: "Permanent Redirect",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/308",
	},
] as const satisfies ReadonlyArray<StatusCodeObject>;
export const redirectionResponseCodes = redirectionResponses.map(
	(code) => code.statusCode,
);
export type RedirectionResponseCodes =
	(typeof redirectionResponseCodes)[number];
export function isRedirectionResponseCode(
	code:
		| InformationResponseCodes
		| SuccessfulResponseCodes
		| RedirectionResponseCodes
		| ClientErrorResponseCodes
		| ServerErrorResponseCodes,
): code is RedirectionResponseCodes {
	if (redirectionResponseCodes.includes(code as RedirectionResponseCodes)) {
		return true;
	}
	return false;
}

export const clientErrorResponses = [
	{
		statusCode: 400,
		statusMessage: "Bad Request",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/400",
	},
	{
		statusCode: 401,
		statusMessage: "Unauthorized",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/401",
	},
	{
		statusCode: 402,
		statusMessage: "Payment Required",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/402",
	},
	{
		statusCode: 403,
		statusMessage: "Forbidden",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/403",
	},
	{
		statusCode: 404,
		statusMessage: "Not Found",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/404",
	},
	{
		statusCode: 405,
		statusMessage: "Method Not Allowed",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/405",
	},
	{
		statusCode: 406,
		statusMessage: "Not Acceptable",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/406",
	},
	{
		statusCode: 407,
		statusMessage: "Proxy Authentication Required",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/407",
	},
	{
		statusCode: 408,
		statusMessage: "Request Timeout",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/408",
	},
	{
		statusCode: 409,
		statusMessage: "Gone",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/409",
	},
	{
		statusCode: 410,
		statusMessage: "Conflict",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/410",
	},
	{
		statusCode: 411,
		statusMessage: "Length Required",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/411",
	},
	{
		statusCode: 412,
		statusMessage: "Precondition Failed",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/412",
	},
	{
		statusCode: 413,
		statusMessage: "Payload Too Large",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/413",
	},
	{
		statusCode: 414,
		statusMessage: "URI Too Long",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/414",
	},
	{
		statusCode: 415,
		statusMessage: "Unsupported Media Type",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/415",
	},
	{
		statusCode: 416,
		statusMessage: "Range Not Satisfiable",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/416",
	},
	{
		statusCode: 417,
		statusMessage: "Expectation Failed",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/417",
	},
	{
		statusCode: 418,
		statusMessage: "I'm a teapot",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/418",
	},
	{
		statusCode: 421,
		statusMessage: "Misdirected Request",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/421",
	},
	{
		statusCode: 422,
		statusMessage: "Unprocessable Content",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/422",
	},
	{
		statusCode: 423,
		statusMessage: "Locked",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/423",
	},
	{
		statusCode: 424,
		statusMessage: "Failed Dependency",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/424",
	},
	{
		statusCode: 425,
		statusMessage: "Too Early",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/425",
	},
	{
		statusCode: 426,
		statusMessage: "Upgrade Required",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/426",
	},
	{
		statusCode: 428,
		statusMessage: "Precondition Required",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/428",
	},
	{
		statusCode: 429,
		statusMessage: "Too Many Requests",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/429",
	},
	{
		statusCode: 431,
		statusMessage: "Request Header Fields Too Large",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/431",
	},
	{
		statusCode: 451,
		statusMessage: "Unavailable For Legal Reasons",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/451",
	},
] as const satisfies ReadonlyArray<StatusCodeObject>;
export const clientErrorResponseCodes = clientErrorResponses.map(
	(code) => code.statusCode,
);
export type ClientErrorResponseCodes =
	(typeof clientErrorResponseCodes)[number];
export function isClientErrorResponseCode(
	code:
		| InformationResponseCodes
		| SuccessfulResponseCodes
		| RedirectionResponseCodes
		| ClientErrorResponseCodes
		| ServerErrorResponseCodes,
): code is ClientErrorResponseCodes {
	if (clientErrorResponseCodes.includes(code as ClientErrorResponseCodes)) {
		return true;
	}
	return false;
}

export const serverErrorResponses = [
	{
		statusCode: 500,
		statusMessage: "Internal Server Error",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/500",
	},
	{
		statusCode: 501,
		statusMessage: "Not Implemented",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/501",
	},
	{
		statusCode: 502,
		statusMessage: "Bad Gateway",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/502",
	},
	{
		statusCode: 503,
		statusMessage: "Service Unavailable",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/503",
	},
	{
		statusCode: 504,
		statusMessage: "Gateway Timeout",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/504",
	},
	{
		statusCode: 505,
		statusMessage: "HTTP Version Not Supported",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/505",
	},
	{
		statusCode: 506,
		statusMessage: "Variant Also Negotiates",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/506",
	},
	{
		statusCode: 507,
		statusMessage: "Insufficient Storage",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/507",
	},
	{
		statusCode: 508,
		statusMessage: "Loop Detected",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/508",
	},
	{
		statusCode: 510,
		statusMessage: "Not Extended",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/510",
	},
	{
		statusCode: 511,
		statusMessage: "Network Authentication Required",
		docs: "https://developer.mozilla.org/docs/Web/HTTP/Status/511",
	},
] as const satisfies ReadonlyArray<StatusCodeObject>;
export const serverErrorResponseCodes = serverErrorResponses.map(
	(code) => code.statusCode,
);
export type ServerErrorResponseCodes =
	(typeof serverErrorResponseCodes)[number];
export function isServerErrorResponseCode(
	code:
		| InformationResponseCodes
		| SuccessfulResponseCodes
		| RedirectionResponseCodes
		| ClientErrorResponseCodes
		| ServerErrorResponseCodes,
): code is ServerErrorResponseCodes {
	if (serverErrorResponseCodes.includes(code as ServerErrorResponseCodes)) {
		return true;
	}
	return false;
}

export type AnyValidResponseCode =
	| InformationResponseCodes
	| SuccessfulResponseCodes
	| RedirectionResponseCodes
	| ClientErrorResponseCodes
	| ServerErrorResponseCodes;

export function isValidResponseCode(
	code: number,
): code is AnyValidResponseCode {
	return (
		informationResponseCodes.includes(code as InformationResponseCodes) ||
		successfulResponseCodes.includes(code as SuccessfulResponseCodes) ||
		redirectionResponseCodes.includes(code as RedirectionResponseCodes) ||
		clientErrorResponseCodes.includes(code as ClientErrorResponseCodes) ||
		serverErrorResponseCodes.includes(code as ServerErrorResponseCodes)
	);
}
