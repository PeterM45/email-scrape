---
"email-scrape": minor
---

Major improvements with real-world integration testing and enhanced validation:

**Enhanced Email Validation:**
- Increased TLD limit from 6 to 24 characters to support modern long TLDs like `.international`, `.photography`, `.business`
- Improved regex pattern with proper negative lookbehind/lookahead to prevent matching concatenated text
- Enhanced `sanitizeEmail()` validation to reject malformed email structures

**Contact Page Discovery:**
- Automatically discovers and scrapes `/contact`, `/about`, and similar pages
- New `followContactPages` option (default: true) to control behavior
- Limits discovery to 5 pages maximum to prevent excessive requests

**404 Fallback Support:**
- Automatically falls back to `/contact` page when main URL fails
- Provides console warnings about fallback behavior
- Intelligently avoids duplicate scraping when using fallback

**TypeScript Support:**
- Complete TypeScript declaration files for all functions and interfaces
- Full type safety for IDE autocompletion

**Real-World Integration Tests:**
- Added actual integration tests that run against live production websites
- Tested and verified against miltonscuisine.com, marqueesteakhouse.com, and turtlejacks.com
- 10 unit tests + 3 integration tests, all passing
- New npm scripts: `test`, `test:integration`, `test:all`

