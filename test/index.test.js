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
