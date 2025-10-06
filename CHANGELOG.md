# email-scrape

## 0.7.0

### Minor Changes

- ab87cb6: Refactor HTML parsing from Cheerio to node-html-parser and add performance benchmarks:

  **Breaking Dependency Change:**

  - Replaced `cheerio` (1.1.2) with `node-html-parser` (7.0.1) as the HTML parsing library
  - No API changes - full backward compatibility maintained
  - All existing tests pass without modifications

  **Performance Improvements:**

  - node-html-parser provides ~1,400 operations/second throughput
  - Lightweight alternative with smaller bundle size
  - Faster parsing for typical email extraction scenarios

  **New Benchmark Test Suite:**

  - Added comprehensive performance benchmarks in `test/benchmark.test.js`
  - New `pnpm benchmark` command to run performance tests
  - Benchmarks cover:
    - Email extraction from plain text (small & large inputs)
    - HTML parsing performance (small & large HTML)
    - End-to-end scraping pipeline
    - Memory usage with large documents (500+ emails)
    - Throughput measurements

  **Performance Metrics:**

  - Email extraction: < 0.1ms for typical inputs
  - HTML parsing: ~1-2ms for pages with 100+ emails
  - End-to-end scraping: ~0.13ms per page (without network I/O)
  - Handles 500+ emails without performance degradation

  **Updated Documentation:**

  - Updated instructions to reflect node-html-parser usage patterns
  - Added benchmark documentation to development workflow

## 0.6.1

### Patch Changes

- 36cbce2: Add modern Biome config and standardize JSDoc comments. Improved linting rules enforce strict equality, no unused imports/variables, Node.js import protocol, and consistent code style. Added comprehensive JSDoc documentation to all public functions for better IDE integration and type hints.

## 0.6.0

### Minor Changes

- 150be8b: Major improvements with real-world integration testing and smart email extraction:

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

## 0.5.0

### Minor Changes

- a791073: Major improvements with real-world integration testing and enhanced validation:

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
