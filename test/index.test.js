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

test("extractEmails handles emails after phone numbers", () => {
	// Should extract emails even when concatenated after phone numbers
	const input1 = "878-5717info@example.com"; // Phone number before email
	const emails1 = extractEmails(input1);
	assert.deepEqual(emails1, ["info@example.com"]);

	const input2 = "123contact@site.org"; // Digits before email
	const emails2 = extractEmails(input2);
	assert.deepEqual(emails2, ["contact@site.org"]);

	// With proper spacing, should still work
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

test("handles 404 with fallback to /contact", async () => {
	const mainHtml = `
		<html>
			<body>
				<h1>Main Page</h1>
				<a href="/contact">Contact Us</a>
			</body>
		</html>
	`;

	const contactHtml = `
		<html>
			<body>
				<h1>Contact Us</h1>
				<p>Email: <a href="mailto:contact@example.com">contact@example.com</a></p>
			</body>
		</html>
	`;

	const fetchedUrls = [];
	const mockFetch = (url) => {
		fetchedUrls.push(url);

		// Simulate 404 for the main page
		if (url === "https://example.com/404page") {
			return Promise.resolve({
				ok: false,
				status: 404,
				statusText: "Not Found",
				text: async () => "<html><body>404 Not Found</body></html>",
				headers: {
					get: () => "text/html",
				},
			});
		}

		// Return contact page content
		if (url.includes("/contact")) {
			return Promise.resolve({
				ok: true,
				status: 200,
				statusText: "OK",
				text: async () => contactHtml,
				headers: {
					get: () => "text/html",
				},
			});
		}

		// Main page
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

	const emails = await scrapeEmailsFromWebsite("https://example.com/404page", {
		fetch: mockFetch,
	});

	// Should have attempted the 404 page
	assert.ok(
		fetchedUrls.some((url) => url.includes("/404page")),
		"Should try to fetch the main page",
	);

	// Should have fallen back to contact page
	assert.ok(
		fetchedUrls.some((url) => url.includes("/contact")),
		"Should fall back to /contact page after 404",
	);

	// Should extract email from contact page
	assert.ok(
		emails.includes("contact@example.com"),
		"Should extract email from fallback contact page",
	);
});
