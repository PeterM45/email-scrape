import { parse } from "node-html-parser";

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
	const root = parse(html);
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

	const body = root.querySelector("body");
	const text = body ? body.textContent : root.textContent;
	for (const email of extractEmails(text)) {
		addCandidate(email, "text");
	}

	const mailtoLinks = root.querySelectorAll('a[href^="mailto:"]');
	for (const element of mailtoLinks) {
		const href = element.getAttribute("href");
		if (!href) {
			continue;
		}
		const email = href.replace(/^mailto:/i, "").split("?")[0];
		addCandidate(email, "mailto");
	}

	const attributeElements = root.querySelectorAll(ATTRIBUTE_SELECTORS.join(","));
	for (const element of attributeElements) {
		for (const attr of Object.keys(element.attributes)) {
			const value = element.getAttribute(attr);
			if (value?.includes("@")) {
				addCandidate(value, "attribute");
			}
		}
	}

	const metaElements = root.querySelectorAll(STRUCTURED_META_SELECTOR);
	for (const element of metaElements) {
		const value = element.getAttribute("content");
		if (value) {
			addCandidate(value, "structured");
		}
	}

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
