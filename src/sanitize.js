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

	const lower = trimmed.toLowerCase();

	// Additional validation checks
	const [localPart, domain] = lower.split("@");

	// Reject if local part or domain is too short
	if (localPart.length < 1 || domain.length < 3) {
		return null;
	}

	// Reject if local part doesn't start with letter or digit
	if (!/^[a-z0-9]/.test(localPart)) {
		return null;
	}

	// Reject common invalid patterns
	if (
		localPart.startsWith(".") ||
		localPart.endsWith(".") ||
		localPart.includes("..") ||
		domain.startsWith(".") ||
		domain.endsWith(".") ||
		domain.includes("..") ||
		domain.startsWith("-") ||
		domain.endsWith("-")
	) {
		return null;
	}

	// Reject if domain doesn't have a valid TLD
	const tld = domain.split(".").pop();
	if (!tld || tld.length < 2 || tld.length > 24) {
		return null;
	}

	// Reject TLDs that contain only lowercase letters followed by uppercase
	// This catches cases like "comFollow" being incorrectly extracted as TLD
	if (tld !== tld.toLowerCase() && tld !== tld.toUpperCase()) {
		return null;
	}

	return lower;
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
