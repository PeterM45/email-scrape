import assert from "node:assert/strict";
import test from "node:test";

import { scrapeEmailFromWebsite, scrapeEmailsFromWebsite } from "../src/index.js";

// Real-world integration tests that actually hit live websites
// These verify the scraper works on actual production sites

test("Real integration: miltonscuisine.com extracts emails (plural)", async () => {
	const emails = await scrapeEmailsFromWebsite("https://www.miltonscuisine.com");

	console.log("miltonscuisine.com emails:", emails);

	assert.ok(
		emails.includes("miltons@sphospitality.com"),
		`Should extract miltons@sphospitality.com. Got: ${JSON.stringify(emails)}`
	);
});

test("Real integration: miltonscuisine.com extracts single email", async () => {
	const email = await scrapeEmailFromWebsite("https://www.miltonscuisine.com");

	console.log("miltonscuisine.com single email:", email);

	assert.strictEqual(
		email,
		"miltons@sphospitality.com",
		`Should return miltons@sphospitality.com. Got: ${email}`
	);
});

test("Real integration: marqueesteakhouse.com extracts email", async () => {
	const emails = await scrapeEmailsFromWebsite("https://marqueesteakhouse.com");

	console.log("marqueesteakhouse.com emails:", emails);

	// Email is concatenated with phone number in the HTML: "878-5717info@marqueesteakhouse.com"
	// Our regex should handle this case
	assert.ok(
		emails.includes("info@marqueesteakhouse.com"),
		`Should extract info@marqueesteakhouse.com. Got: ${JSON.stringify(emails)}`
	);
});

test("Real integration: turtlejacks.com handles 404 with fallback", async () => {
	const emails = await scrapeEmailsFromWebsite(
		"https://turtlejacks.com/locations/turtle-jacks-milton/?utm_source=G&utm_medium=LPM&utm_campaign=MTY"
	);

	console.log("turtlejacks.com emails:", emails);

	assert.ok(
		emails.includes("info@turtlejacks.com"),
		`Should fall back to contact page and extract info@turtlejacks.com. Got: ${JSON.stringify(emails)}`
	);
});
