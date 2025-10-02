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

test("Real-world: miltonscuisine.com should extract email from contact page", async () => {
	const mainHtml = `
		<html>
			<body>
				<nav>
					<a href="/about">ABOUT US</a>
					<a href="/contact">CONTACT</a>
				</nav>
				<p>800 Mayfield Road :: Milton, Ga 30009 :: Ph: 770.817.0161</p>
			</body>
		</html>
	`;

	const contactHtml = `
		<html>
			<body>
				<h1>Contact Us</h1>
				<p>Email us at <a href="mailto:miltons@sphospitality.com">miltons@sphospitality.com</a></p>
			</body>
		</html>
	`;

	const mockFetch = (url) => {
		const html = url.includes("contact") ? contactHtml : mainHtml;
		return Promise.resolve({
			ok: true,
			status: 200,
			statusText: "OK",
			text: async () => html,
			headers: {
				get: () => "text/html",
			},
		});
	};

	const emails = await scrapeEmailsFromWebsite(
		"https://www.miltonscuisine.com",
		{
			fetch: mockFetch,
		},
	);

	assert.ok(
		emails.includes("miltons@sphospitality.com"),
		"Should find email from contact page",
	);
});

test("Real-world: marqueesteakhouse.com should extract clean email", async () => {
	// Based on actual website content - in reality the HTML has more structure
	// Even if rendered text appears concatenated, HTML usually has separation
	const mainHtml = `
		<html>
			<body>
				<h1>MARQUEE STEAKHOUSE</h1>
				<div class="contact">
					<p>204 Main Street East Milton ON L9T 1N8</p>
					<p>(289) 878-5717</p>
					<p>info@marqueesteakhouse.com</p>
					<div class="social">
						<a href="#">follow</a>
						<a href="#">follow</a>
						<a href="#">follow</a>
					</div>
				</div>
			</body>
		</html>
	`;

	const mockFetch = () => {
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

	const emails = await scrapeEmailsFromWebsite(
		"https://marqueesteakhouse.com",
		{
			fetch: mockFetch,
		},
	);

	// Should extract the email cleanly
	assert.ok(
		emails.includes("info@marqueesteakhouse.com"),
		`Should extract email. Got: ${JSON.stringify(emails)}`,
	);
});

test("Real-world: handles 404 with fallback to /contact", async () => {
	const mainHtml = `
		<html>
			<body>
				<h1>Turtle Jacks Milton</h1>
				<a href="/locations/turtle-jacks-milton">Our Location</a>
				<a href="/contact">Contact Us</a>
			</body>
		</html>
	`;

	const contactHtml = `
		<html>
			<body>
				<h1>Contact Us</h1>
				<p>General inquiries: <a href="mailto:info@turtlejacks.com">info@turtlejacks.com</a></p>
			</body>
		</html>
	`;

	const fetchedUrls = [];
	const mockFetch = (url) => {
		fetchedUrls.push(url);

		// Simulate 404 for the specific location page
		if (url.includes("/locations/turtle-jacks-milton")) {
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

	const emails = await scrapeEmailsFromWebsite(
		"https://turtlejacks.com/locations/turtle-jacks-milton/?utm_source=G&utm_medium=LPM&utm_campaign=MTY",
		{
			fetch: mockFetch,
		},
	);

	// Should have attempted the location page
	assert.ok(
		fetchedUrls.some((url) => url.includes("/locations/turtle-jacks-milton")),
		"Should try to fetch the location-specific page",
	);

	// Should have fallen back to contact page
	assert.ok(
		fetchedUrls.some((url) => url.includes("/contact")),
		"Should fall back to /contact page after 404",
	);

	// Should extract email from contact page
	assert.ok(
		emails.includes("info@turtlejacks.com"),
		"Should extract email from fallback contact page",
	);
});
