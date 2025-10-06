import { load } from "cheerio";

import {
	ATTRIBUTE_SELECTORS,
	KEYWORD_BONUS,
	SOURCE_WEIGHT,
	STRUCTURED_META_SELECTOR,
} from "./constants.js";
import { extractEmails, sanitizeEmail } from "./sanitize.js";

/**
 * Extract email candidates from HTML content.
 *
 * @param {string} html - HTML content to parse
 * @returns {Array<{email: string, score: number, source: string}>} Array of email candidates
 */
export function extractCandidates(html) {
	const $ = load(html);
	const candidates = new Map();

	const addCandidate = (email, source, context = {}) => {
		const sanitized = sanitizeEmail(email);
		if (!sanitized) {
			return;
		}

		const existing = candidates.get(sanitized);
		const score = computeScore(sanitized, source, context);

		if (!existing || score > existing.score) {
			candidates.set(sanitized, {
				email: sanitized,
				score,
				source,
			});
		}
	};

	const text = $("body").text();
	for (const email of extractEmails(text)) {
		addCandidate(email, "text");
	}

	$('a[href^="mailto:"]').each((_, element) => {
		const href = $(element).attr("href");
		if (!href) {
			return;
		}
		const email = href.replace(/^mailto:/i, "").split("?")[0];
		addCandidate(email, "mailto");
	});

	$(ATTRIBUTE_SELECTORS.join(",")).each((_, element) => {
		for (const attr of Object.keys(element.attribs ?? {})) {
			const value = $(element).attr(attr);
			if (value?.includes("@")) {
				addCandidate(value, "attribute");
			}
		}
	});

	$(STRUCTURED_META_SELECTOR).each((_, element) => {
		const value = $(element).attr("content");
		if (value) {
			addCandidate(value, "structured");
		}
	});

	return Array.from(candidates.values());
}

/**
 * Rank email candidates by score (descending), then alphabetically.
 *
 * @param {Array<{email: string, score: number, source: string}>} candidates - Email candidates to rank
 * @returns {Array<{email: string, score: number, source: string}>} Sorted candidates
 */
export function rankCandidates(candidates) {
	return candidates.sort((a, b) => {
		if (b.score !== a.score) {
			return b.score - a.score;
		}
		return a.email.localeCompare(b.email);
	});
}

function computeScore(email, source, context = {}) {
	let score = SOURCE_WEIGHT.get(source) ?? 10;
	const lower = email.toLowerCase();

	for (const [keyword, bonus] of KEYWORD_BONUS) {
		if (lower.includes(keyword)) {
			score += bonus;
		}
	}

	if (context.scoreBoost) {
		score += context.scoreBoost;
	}

	return score;
}
