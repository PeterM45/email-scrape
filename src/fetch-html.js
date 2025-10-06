import { DEFAULT_ACCEPT_HEADER, DEFAULT_USER_AGENT } from "./constants.js";

/**
 * @typedef {Object} FetchOptions
 * @property {AbortSignal} [signal]
 * @property {string} [userAgent]
 * @property {Record<string, string>} [headers]
 */

/**
 * Fetch HTML content from a URL using the provided fetch implementation.
 *
 * @param {string} url
 * @param {typeof fetch} fetchImpl
 * @param {FetchOptions} [options]
 */
export async function fetchHtml(url, fetchImpl = globalThis.fetch, options = {}) {
	if (typeof fetchImpl !== "function") {
		throw new Error("A fetch implementation must be provided.");
	}

	const { signal, userAgent = DEFAULT_USER_AGENT, headers = {} } = options;

	const response = await fetchImpl(url, {
		redirect: "follow",
		signal,
		headers: {
			"User-Agent": userAgent,
			Accept: DEFAULT_ACCEPT_HEADER,
			...headers,
		},
	});

	if (!response || typeof response.text !== "function") {
		throw new Error("The provided fetch implementation did not return a valid response.");
	}

	if (!response.ok) {
		throw new Error(
			`Failed to fetch URL: ${response.status ?? ""} ${response.statusText ?? ""}`.trim()
		);
	}

	const contentType = response.headers?.get?.("content-type");
	if (
		contentType &&
		!contentType.includes("text/html") &&
		!contentType.includes("application/xhtml+xml")
	) {
		throw new Error(
			`Unexpected content-type for ${url}: ${contentType}. Only HTML responses are supported.`
		);
	}

	return response.text();
}
