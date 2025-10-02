---
"email-scrape": minor
---

Major improvements with real-world integration testing and smart email extraction:

**Enhanced Email Validation & Extraction:**
- Non-greedy TLD matching (2-63 chars, RFC compliant) to prevent over-matching
- Smart case detection: stops matching at uppercase letters after TLD (e.g., extracts `info@example.com` from `info@example.comFollow`)
- Handles emails concatenated with phone numbers (e.g., `878-5717info@example.com` → `info@example.com`)
- Allows digits before emails but prevents letter/dot prefixes
- Enhanced `sanitizeEmail()` with mixed-case TLD rejection

**Contact Page Discovery & 404 Fallback:**
- Automatically discovers and scrapes `/contact`, `/about`, and similar pages
- New `followContactPages` option (default: true) to control behavior
- Automatic fallback to `/contact` when main URL returns 404
- Console warnings for fallback behavior

**TypeScript Support:**
- Complete TypeScript declaration files for all functions

**Real-World Integration Tests:**
- Added actual integration tests against live production websites
- Tests both plural `scrapeEmailsFromWebsite()` and singular `scrapeEmailFromWebsite()`
- Verified against miltonscuisine.com, marqueesteakhouse.com, and turtlejacks.com
- 10 unit tests + 4 integration tests, all passing
- New npm scripts: `test`, `test:integration`, `test:all`

**Bug Fixes:**
- Fixed extraction of emails with long TLDs like `.hospitality`
- Resolved issue where emails followed by concatenated text were over-matched

