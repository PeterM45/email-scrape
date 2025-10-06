import { discoverContactPages } from "./discover-contact-pages.js";
import { extractCandidates, rankCandidates } from "./extract-candidates.js";
import { fetchHtml } from "./fetch-html.js";
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
 * @param {boolean} [options.followContactPages] - If true, also scrape contact/about pages
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
		followContactPages = true,
	} = options;

	const fetchOptions = { signal, userAgent, headers };

	let html;
	let mainPageFailed = false;

	// Try to scrape main page, fallback to /contact if it fails
	try {
		html = await fetchHtml(normalizedUrl, fetchImpl, fetchOptions);
	} catch (error) {
		mainPageFailed = true;
		// If main page fails (e.g., 404), try /contact as fallback
		if (followContactPages) {
			try {
				const baseUrl = new URL(normalizedUrl);
				const contactUrl = `${baseUrl.origin}/contact`;
				console.warn(`Main page failed (${error.message}), trying fallback: ${contactUrl}`);
				html = await fetchHtml(contactUrl, fetchImpl, fetchOptions);
			} catch (_fallbackError) {
				// Both main page and fallback failed
				throw new Error(`Failed to fetch ${normalizedUrl}: ${error.message}`);
			}
		} else {
			// No fallback allowed, re-throw original error
			throw error;
		}
	}

	const candidates = extractCandidates(html);

	// Optionally scrape contact pages (skip if we already used /contact as fallback)
	if (followContactPages && !mainPageFailed) {
		const contactUrls = discoverContactPages(html, normalizedUrl);

		for (const contactUrl of contactUrls) {
			try {
				const contactHtml = await fetchHtml(contactUrl, fetchImpl, fetchOptions);
				const contactCandidates = extractCandidates(contactHtml);
				candidates.push(...contactCandidates);
			} catch (error) {
				// Silently fail for contact pages - still return main page results
				console.warn(`Failed to scrape contact page ${contactUrl}:`, error.message);
			}
		}
	}

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
