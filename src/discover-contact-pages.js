import { load } from "cheerio";

const CONTACT_KEYWORDS = [
	"contact",
	"contact-us",
	"contactus",
	"about",
	"about-us",
	"aboutus",
	"team",
	"reach",
	"get-in-touch",
];

/**
 * Extract potential contact page URLs from HTML.
 *
 * @param {string} html - HTML content to parse
 * @param {string} baseUrl - Base URL for resolving relative links
 * @returns {string[]} Array of absolute URLs to potential contact pages
 */
export function discoverContactPages(html, baseUrl) {
	const $ = load(html);
	const contactUrls = new Set();
	const base = new URL(baseUrl);

	$("a[href]").each((_, element) => {
		const href = $(element).attr("href");
		const text = $(element).text().toLowerCase().trim();

		if (!href) {
			return;
		}

		// Check if link text or href contains contact keywords
		const isContactLink = CONTACT_KEYWORDS.some(
			(keyword) => text.includes(keyword) || href.toLowerCase().includes(keyword)
		);

		if (!isContactLink) {
			return;
		}

		try {
			// Resolve relative URLs
			const absoluteUrl = new URL(href, base);

			// Only include URLs from the same domain
			if (absoluteUrl.hostname === base.hostname) {
				// Remove hash fragments
				absoluteUrl.hash = "";
				contactUrls.add(absoluteUrl.toString());
			}
		} catch {
			// Invalid URL, skip
		}
	});

	return Array.from(contactUrls).slice(0, 5); // Limit to 5 pages
}
