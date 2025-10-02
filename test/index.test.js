import assert from "node:assert/strict";
import test from "node:test";

import {
	extractEmails,
	scrapeEmailFromWebsite,
	scrapeEmailsFromWebsite,
} from "../src/index.js";

const createFetch =
	(html, { status = 200, headers = {} } = {}) =>
	async () => ({
		ok: status >= 200 && status < 300,
		status,
		statusText: status === 200 ? "OK" : "Error",
		text: async () => html,
		headers: {
			get: (name) => headers[name.toLowerCase()] ?? null,
		},
	});

test("extractEmails normalizes punctuation and casing", () => {
	const input =
		"Email Support@Example.com, sales@example.com; support@example.com!";
	const emails = extractEmails(input);

	assert.deepEqual(emails.sort(), ["sales@example.com", "support@example.com"]);
});

test("extractEmails handles non-string input", () => {
	assert.deepEqual(extractEmails(null), []);
	assert.deepEqual(extractEmails(123), []);
});

test("scrapeEmailsFromWebsite ranks candidates by source", async () => {
	const html = `
		<html>
			<body>
				<p>Contact Support@Example.com for help.</p>
				<a href="mailto:contact@example.com">Email us</a>
				<meta name="email" content="meta@example.com" />
			</body>
		</html>
	`;

	const emails = await scrapeEmailsFromWebsite("https://example.com", {
		fetch: createFetch(html, {
			headers: { "content-type": "text/html" },
		}),
	});

	assert.deepEqual(emails, [
		"contact@example.com",
		"meta@example.com",
		"support@example.com",
	]);
});

test("scrapeEmailFromWebsite returns highest ranked candidate", async () => {
	const html = `
		<html>
			<body>
				<p>Email hello@example.com</p>
				<a href="mailto:contact@example.com">Email us</a>
			</body>
		</html>
	`;

	const email = await scrapeEmailFromWebsite("https://example.com", {
		fetch: createFetch(html, {
			headers: { "content-type": "text/html" },
		}),
	});

	assert.equal(email, "contact@example.com");
});

test("scrapeEmailsFromWebsite rejects invalid URLs", async () => {
	await assert.rejects(
		() => scrapeEmailsFromWebsite("/relative"),
		new TypeError("url must be a valid absolute URL"),
	);
});

test("extractEmails rejects invalid email formats", () => {
	// When emails are run together with other text without proper boundaries
	const badInput1 = "878-5717info@example.com"; // No space before email
	const badInput2 = "123contact@site.org"; // Starts with digits

	assert.deepEqual(extractEmails(badInput1), []);
	assert.deepEqual(extractEmails(badInput2), []);

	// But with proper spacing/boundaries, emails should be extracted
	const goodInput =
		"Call 878-5717 or email info@example.com, or contact@site.org";
	const emails = extractEmails(goodInput);
	assert.deepEqual(emails.sort(), ["contact@site.org", "info@example.com"]);
});

test("extractEmails validates email structure", () => {
	const invalid = [
		".info@example.com", // starts with dot
		"info.@example.com", // ends with dot
		"info..test@example.com", // double dot
		"info@.example.com", // domain starts with dot
		"info@example..com", // domain double dot
		"info@-example.com", // domain starts with dash
		"info@example.c", // TLD too short
	];

	for (const email of invalid) {
		const result = extractEmails(email);
		assert.deepEqual(result, [], `Should reject invalid email: ${email}`);
	}
});

test("scrapeEmailsFromWebsite discovers and scrapes contact pages", async () => {
	const mainHtml = `
		<html>
			<body>
				<p>Main page</p>
				<a href="/contact">Contact Us</a>
			</body>
		</html>
	`;

	const contactHtml = `
		<html>
			<body>
				<a href="mailto:support@example.com">Email Support</a>
			</body>
		</html>
	`;

	let fetchCount = 0;
	const mockFetch = (url) => {
		fetchCount++;
		const html = url.includes("contact") ? contactHtml : mainHtml;
		return Promise.resolve({
			ok: true,
			status: 200,
			statusText: "OK",
			text: async () => html,
			headers: {
				get: (name) =>
					name.toLowerCase() === "content-type" ? "text/html" : null,
			},
		});
	};

	const emails = await scrapeEmailsFromWebsite("https://example.com", {
		fetch: mockFetch,
		followContactPages: true,
	});

	assert.ok(fetchCount > 1, "Should fetch contact page");
	assert.ok(
		emails.includes("support@example.com"),
		"Should find email from contact page",
	);
});

test("scrapeEmailsFromWebsite can skip contact pages", async () => {
	const mainHtml = `
		<html>
			<body>
				<p>Email: info@example.com</p>
				<a href="/contact">Contact Us</a>
			</body>
		</html>
	`;

	let fetchCount = 0;
	const mockFetch = () => {
		fetchCount++;
		return Promise.resolve({
			ok: true,
			status: 200,
			statusText: "OK",
			text: async () => mainHtml,
			headers: {
				get: () => "text/html",
			},
		});
	};

	await scrapeEmailsFromWebsite("https://example.com", {
		fetch: mockFetch,
		followContactPages: false,
	});

	assert.strictEqual(fetchCount, 1, "Should only fetch main page");
});
