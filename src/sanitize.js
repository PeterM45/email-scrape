import { createEmailGlobalRegex, EMAIL_VALIDATION_REGEX } from "./constants.js";

const EMAIL_GLOBAL_REGEX = createEmailGlobalRegex();

export function sanitizeEmail(raw) {
	if (typeof raw !== "string") {
		return null;
	}

	const trimmed = raw
		.trim()
		.replace(/^[<(["']+/, "")
		.replace(/[>\])"']+$/, "")
		.replace(/[.,;:!?]+$/, "");

	if (!EMAIL_VALIDATION_REGEX.test(trimmed)) {
		return null;
	}

	return trimmed.toLowerCase();
}

export function normalizeEmails(inputs) {
	const unique = new Set();
	for (const input of inputs ?? []) {
		const sanitized = sanitizeEmail(input);
		if (sanitized) {
			unique.add(sanitized);
		}
	}
	return Array.from(unique);
}

export function extractEmails(input) {
	if (typeof input !== "string") {
		return [];
	}

	EMAIL_GLOBAL_REGEX.lastIndex = 0;
	const matches = input.match(EMAIL_GLOBAL_REGEX);
	if (!matches) {
		return [];
	}

	return normalizeEmails(matches);
}
