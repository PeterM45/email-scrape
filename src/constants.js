/**
 * Email pattern regex string.
 * - Must start with a letter
 * - Allows digits before @ (handles "123-456-7890info@example.com")
 * - Prevents letters/dots before @ (avoids matching middle of emails)
 * - TLD: 2-63 characters (RFC compliant), non-greedy
 * - Followed by non-letter or end of string (prevents "comFollow" as TLD)
 */
export const EMAIL_PATTERN =
	"(?<![a-zA-Z.])[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\\.[a-zA-Z]{2,63}?(?![a-z])";

export const ATTRIBUTE_SELECTORS = [
	"[data-email]",
	"[data-contact-email]",
	"[data-mail]",
	"[itemprop='email']",
	"[itemprop='emailAddress']",
	"[aria-label*='email' i]",
];

export const STRUCTURED_META_SELECTOR =
	"meta[name*='mail' i], meta[name*='email' i], meta[property*='email' i]";

export const SOURCE_WEIGHT = new Map([
	["mailto", 60],
	["attribute", 40],
	["structured", 35],
	["text", 20],
]);

export const KEYWORD_BONUS = new Map([
	["support", 15],
	["contact", 12],
	["help", 10],
	["info", 8],
	["hello", 6],
	["sales", 6],
	["team", 4],
]);

export const EMAIL_VALIDATION_REGEX = new RegExp(`^${EMAIL_PATTERN}$`);

export function createEmailGlobalRegex() {
	return new RegExp(EMAIL_PATTERN, "g");
}

export const DEFAULT_USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

export const DEFAULT_ACCEPT_HEADER = "text/html,application/xhtml+xml";
