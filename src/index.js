import { fetchHtml } from "./fetch-html.js";
import { extractCandidates, rankCandidates } from "./extract-candidates.js";
import {
	extractEmails as extractEmailsFromString,
	normalizeEmails,
	sanitizeEmail,
} from "./sanitize.js";

/**
 * Extract unique, normalized email addresses from plain text input.
 *
 * @param {string} input
 * @returns {string[]}
 */
export function extractEmails(input) {
	return extractEmailsFromString(input);
}

/**
 * Fetch a webpage and return ranked email candidates.
 *
 * @param {string} url
 * @param {Object} [options]
 * @param {typeof fetch} [options.fetch]
 * @param {AbortSignal} [options.signal]
 * @param {string} [options.userAgent]
 * @param {Record<string, string>} [options.headers]
 * @returns {Promise<string[]>}
 */
export async function scrapeEmailsFromWebsite(url, options = {}) {
	if (typeof url !== "string" || url.trim() === "") {
		throw new TypeError("url must be a non-empty string");
	}

	let normalizedUrl;
	try {
		normalizedUrl = new URL(url).toString();
	} catch {
		throw new TypeError("url must be a valid absolute URL");
	}

	const {
		fetch: fetchImpl = globalThis.fetch,
		signal,
		userAgent,
		headers,
	} = options;

	const html = await fetchHtml(normalizedUrl, fetchImpl, {
		signal,
		userAgent,
		headers,
	});

	const candidates = extractCandidates(html);
	const ranked = rankCandidates(candidates);

	return ranked.map((candidate) => candidate.email);
}

/**
 * Convenience helper returning only the highest-ranked email from a webpage.
 *
 * @param {string} url
 * @param {Object} [options]
 * @returns {Promise<string|null>}
 */
export async function scrapeEmailFromWebsite(url, options = {}) {
	const candidates = await scrapeEmailsFromWebsite(url, options);
	return candidates[0] ?? null;
}

export { fetchHtml };
export { normalizeEmails, sanitizeEmail };

export default {
	extractEmails,
	scrapeEmailsFromWebsite,
	scrapeEmailFromWebsite,
	fetchHtml,
	normalizeEmails,
	sanitizeEmail,
};
