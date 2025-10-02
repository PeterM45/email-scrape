/**
 * Options for fetching HTML from a URL.
 */
export interface FetchOptions {
	/** Custom fetch implementation (defaults to global fetch) */
	fetch?: typeof fetch;
	/** Abort signal to cancel the request */
	signal?: AbortSignal;
	/** Override the default user-agent string */
	userAgent?: string;
	/** Additional headers to merge with defaults */
	headers?: Record<string, string>;
	/** If true, also discover and scrape contact/about pages (default: true) */
	followContactPages?: boolean;
}

/**
 * Extract unique, normalized email addresses from plain text input.
 *
 * @param input - The text to extract emails from
 * @returns Array of unique, normalized email addresses
 */
export function extractEmails(input: string): string[];

/**
 * Fetch a webpage and return ranked email candidates.
 *
 * @param url - The URL to scrape for email addresses
 * @param options - Optional fetch configuration
 * @returns Promise resolving to array of ranked email addresses
 */
export function scrapeEmailsFromWebsite(
	url: string,
	options?: FetchOptions,
): Promise<string[]>;

/**
 * Convenience helper returning only the highest-ranked email from a webpage.
 *
 * @param url - The URL to scrape for email addresses
 * @param options - Optional fetch configuration
 * @returns Promise resolving to the top-ranked email or null if none found
 */
export function scrapeEmailFromWebsite(
	url: string,
	options?: FetchOptions,
): Promise<string | null>;

/**
 * Fetch HTML content from a URL using the provided fetch implementation.
 *
 * @param url - The URL to fetch
 * @param fetchImpl - Custom fetch implementation
 * @param options - Optional fetch configuration
 * @returns Promise resolving to HTML content as string
 */
export function fetchHtml(
	url: string,
	fetchImpl?: typeof fetch,
	options?: Omit<FetchOptions, "fetch">,
): Promise<string>;

/**
 * Normalize an array of email addresses to unique, sanitized values.
 *
 * @param inputs - Array of email addresses to normalize
 * @returns Array of unique, normalized email addresses
 */
export function normalizeEmails(inputs: string[]): string[];

/**
 * Sanitize a single email address.
 *
 * @param raw - Raw email string to sanitize
 * @returns Normalized email address or null if invalid
 */
export function sanitizeEmail(raw: string): string | null;

declare const _default: {
	extractEmails: typeof extractEmails;
	scrapeEmailsFromWebsite: typeof scrapeEmailsFromWebsite;
	scrapeEmailFromWebsite: typeof scrapeEmailFromWebsite;
	fetchHtml: typeof fetchHtml;
	normalizeEmails: typeof normalizeEmails;
	sanitizeEmail: typeof sanitizeEmail;
};

export default _default;
