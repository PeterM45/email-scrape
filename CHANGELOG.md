# email-scrape

## 0.4.0

### Minor Changes

- 33525f6: Major improvements to email validation, contact page discovery, and error handling:

  **Enhanced Email Validation:**

  - Improved regex pattern to prevent extracting malformed emails from concatenated text (e.g., "878-5717info@example.com")
  - Limited TLD matching to 2-6 characters to prevent matching invalid domains
  - Added negative lookbehind and lookahead to ensure proper word boundaries
  - Enhanced validation in `sanitizeEmail()` to reject emails with invalid structures

  **Contact Page Discovery:**

  - Automatically discovers and scrapes `/contact`, `/about`, and similar pages for additional emails
  - New `followContactPages` option (default: true) to enable/disable this behavior
  - Limits contact page discovery to 5 pages maximum to prevent excessive requests

  **404 Fallback Support:**

  - Automatically falls back to `/contact` page when main URL returns 404 or other errors
  - Provides clear console warnings about fallback behavior
  - Intelligently skips duplicate contact page scraping when using fallback

  **TypeScript Support:**

  - Added complete TypeScript declaration files (`src/index.d.ts`)
  - Full type safety for all exported functions and interfaces

  **Real-World Testing:**

  - Added comprehensive integration tests based on actual websites
  - Tests for miltonscuisine.com, marqueesteakhouse.com, and turtlejacks.com scenarios
  - 12 total tests covering validation, discovery, and error handling

## 0.3.0

### Minor Changes

- cb8286c: Major improvements to email extraction and validation:

  - Add TypeScript declaration files for better IDE support and type safety
  - Significantly improve email validation to reject malformed emails (fixes issue with text like '878-5717info@example.com')
  - Add automatic contact page discovery - now scrapes /contact, /about, and similar pages for additional emails
  - Add `followContactPages` option to control contact page scraping behavior (defaults to true)
  - Enhance email regex with proper word boundaries and validation
  - Add comprehensive tests for email validation and contact page discovery

## 0.2.1

### Patch Changes

- cb8286c: Add TypeScript declaration files for better IDE support and type safety

## 0.2.0

### Minor Changes

- c5b26d9: Adjust CI config

### Patch Changes

- 7f69d11: env
