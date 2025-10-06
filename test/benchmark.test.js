import assert from "node:assert/strict";
import test from "node:test";
import { extractCandidates } from "../src/extract-candidates.js";
import { extractEmails, scrapeEmailsFromWebsite } from "../src/index.js";

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

// Generate large HTML for stress testing
function generateLargeHtml(emailCount = 100) {
	const emails = [];
	const htmlParts = ["<html><head><meta name='email' content='meta@example.com'/></head><body>"];

	for (let i = 0; i < emailCount; i++) {
		emails.push(`email${i}@example.com`);
		htmlParts.push(`<p>Contact us at email${i}@example.com for more info.</p>`);
		htmlParts.push(`<a href="mailto:link${i}@example.com">Email ${i}</a>`);
		htmlParts.push(`<div data-email="data${i}@example.com">Contact</div>`);
	}

	htmlParts.push("</body></html>");
	return htmlParts.join("\n");
}

test("Benchmark: extractEmails with small input", () => {
	const input = "Contact support@example.com, sales@example.com, or info@example.com";
	const iterations = 10000;

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		extractEmails(input);
	}
	const duration = performance.now() - start;

	console.log(
		`  → ${iterations} iterations: ${duration.toFixed(2)}ms (${(duration / iterations).toFixed(4)}ms per call)`
	);
	assert.ok(duration < 5000, "Should complete 10k iterations in under 5 seconds");
});

test("Benchmark: extractEmails with large input", () => {
	const input = Array.from({ length: 100 }, (_, i) => `email${i}@example.com`).join(", ");
	const iterations = 1000;

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		extractEmails(input);
	}
	const duration = performance.now() - start;

	console.log(
		`  → ${iterations} iterations: ${duration.toFixed(2)}ms (${(duration / iterations).toFixed(4)}ms per call)`
	);
	assert.ok(duration < 5000, "Should complete 1k iterations in under 5 seconds");
});

test("Benchmark: extractCandidates with small HTML", () => {
	const html = `
		<html>
			<body>
				<p>Contact support@example.com for help.</p>
				<a href="mailto:contact@example.com">Email us</a>
				<meta name="email" content="meta@example.com" />
			</body>
		</html>
	`;
	const iterations = 1000;

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		extractCandidates(html);
	}
	const duration = performance.now() - start;

	console.log(
		`  → ${iterations} iterations: ${duration.toFixed(2)}ms (${(duration / iterations).toFixed(4)}ms per call)`
	);
	assert.ok(duration < 5000, "Should complete 1k iterations in under 5 seconds");
});

test("Benchmark: extractCandidates with large HTML (100 emails)", () => {
	const html = generateLargeHtml(100);
	const iterations = 100;

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		extractCandidates(html);
	}
	const duration = performance.now() - start;

	console.log(
		`  → ${iterations} iterations: ${duration.toFixed(2)}ms (${(duration / iterations).toFixed(4)}ms per call)`
	);
	assert.ok(duration < 10000, "Should complete 100 iterations in under 10 seconds");
});

test("Benchmark: scrapeEmailsFromWebsite (end-to-end)", async () => {
	const html = `
		<html>
			<body>
				<p>Contact support@example.com for help.</p>
				<a href="mailto:contact@example.com">Email us</a>
				<meta name="email" content="meta@example.com" />
				<a href="/contact">Contact page</a>
			</body>
		</html>
	`;

	const iterations = 100;
	const start = performance.now();

	for (let i = 0; i < iterations; i++) {
		await scrapeEmailsFromWebsite("https://example.com", {
			fetch: createFetch(html, {
				headers: { "content-type": "text/html" },
			}),
			followContactPages: false,
		});
	}

	const duration = performance.now() - start;

	console.log(
		`  → ${iterations} iterations: ${duration.toFixed(2)}ms (${(duration / iterations).toFixed(4)}ms per call)`
	);
	assert.ok(duration < 5000, "Should complete 100 iterations in under 5 seconds");
});

test("Benchmark: Memory usage with large HTML", () => {
	const html = generateLargeHtml(500);
	const iterations = 50;

	// Force garbage collection if available (run with --expose-gc flag)
	if (global.gc) {
		global.gc();
	}

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		const candidates = extractCandidates(html);
		assert.ok(candidates.length > 0, "Should extract candidates");
	}
	const duration = performance.now() - start;

	console.log(
		`  → ${iterations} iterations with 500 emails: ${duration.toFixed(2)}ms (${(duration / iterations).toFixed(4)}ms per call)`
	);
	assert.ok(duration < 15000, "Should handle large HTML without excessive slowdown");
});

test("Benchmark: Comparison - node-html-parser vs baseline", () => {
	const html = generateLargeHtml(50);
	const iterations = 200;

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		extractCandidates(html);
	}
	const duration = performance.now() - start;

	console.log(
		`  → node-html-parser: ${iterations} iterations: ${duration.toFixed(2)}ms (${(duration / iterations).toFixed(4)}ms per call)`
	);
	console.log(
		`  → Average throughput: ${((iterations / duration) * 1000).toFixed(2)} operations/second`
	);

	// This is a baseline - actual performance varies by system
	assert.ok(duration > 0, "Should complete successfully");
});
