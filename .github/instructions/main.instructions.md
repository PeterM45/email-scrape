---
applyTo: '**'
---

## Project Overview

**email-scrape** is a Node.js library (ESM) that extracts and ranks email addresses from HTML content and live websites. It uses a multi-source scoring system to prioritize high-quality email addresses.

## Architecture

### Core Pipeline (src/index.js)
The main scraping flow follows this sequence:
1. **Fetch HTML** (`fetch-html.js`) - Retrieve content with custom fetch impl, validates HTML content-type
2. **Extract Candidates** (`extract-candidates.js`) - Parse HTML using node-html-parser to find emails from multiple sources
3. **Discover Contact Pages** (`discover-contact-pages.js`) - Automatically find `/contact`, `/about` pages (if `followContactPages: true`)
4. **Rank Candidates** - Score emails by source quality + keyword bonuses, return sorted list

### Email Scoring System (extract-candidates.js)
Candidates are scored using weights defined in `constants.js`:
- **Source weights**: `mailto:` links (60) > data attributes (40) > meta tags (35) > plain text (20)
- **Keyword bonuses**: "support" (+15), "contact" (+12), "help" (+10), "info" (+8), etc.
- Higher scores rank first; ties broken alphabetically

### Email Validation (sanitize.js)
The regex pattern in `constants.js` enforces strict validation:
- Must start with letter (prevents false positives like "test.info@example.com")
- Allows digits before @ (handles "878-5717info@example.com" from real websites)
- Uses negative lookbehind `(?<![a-zA-Z.])` to prevent mid-string matches
- TLD: 2-63 chars, followed by `(?![a-z])` to reject malformed TLDs like "comFollow"

**Critical validation rules in `sanitizeEmail()`**:
- Reject emails with leading/trailing/consecutive dots in local part or domain
- Reject domains starting/ending with hyphens
- Reject TLDs with mixed case (catches extraction errors)

### 404 Fallback Behavior (src/index.js)
When main page fetch fails AND `followContactPages: true`:
1. Attempts fallback to `/contact` (baseUrl + "/contact")
2. If fallback succeeds, skips contact page discovery (avoids duplicate fetch)
3. If both fail, throws original error

## Development Workflow

### Testing
- **Unit tests**: `pnpm test` (runs `test/index.test.js` with Node's built-in test runner)
- **Integration tests**: `pnpm test:integration` (hits live websites - may be slow/flaky)
- **Benchmark tests**: `pnpm benchmark` (runs performance benchmarks in `test/benchmark.test.js`)
- **All tests**: `pnpm test:all`
- Use `createFetch()` helper in tests to mock fetch responses with custom status/headers

### Linting
- Uses **Biome** (not ESLint/Prettier): `pnpm lint` or `pnpm check` (auto-fixes)
- Config in `biome.json` enforces modern rules (strict equality, no unused imports, Node.js import protocol, etc.)

### Publishing
- **Changesets workflow**: Run `pnpm changeset` to document changes (creates file in `.changeset/`)
- CI (`.github/workflows/ci.yml`) auto-publishes to npm when changesets exist on main branch
- Uses **npm provenance** (`--provenance` flag) for supply chain security
- Manual: `pnpm changeset version` → `pnpm test` → `pnpm release`

## Key Conventions

### Module System
- **Pure ESM**: All imports use `.js` extensions (required for ESM)
- No build step - ships source directly from `src/`
- TypeScript types in separate `.d.ts` file, manually maintained
- **JSDoc comments**: All public functions documented with JSDoc for IDE integration and type hints

### Error Handling
- Throw `TypeError` for invalid inputs (e.g., non-string URLs, relative URLs)
- Contact page fetch errors are **silently caught** (logged to console.warn) - main page results still returned
- Main page fetch errors are **propagated** (unless fallback succeeds)

### node-html-parser Usage
Always use node-html-parser for HTML parsing:
```javascript
const root = parse(html);
const links = root.querySelectorAll('a[href^="mailto:"]');
for (const element of links) {
  const href = element.getAttribute("href");
  // ...
}
```

### Constants Pattern
All configurable values live in `src/constants.js`:
- Scoring weights (`SOURCE_WEIGHT`, `KEYWORD_BONUS`)
- Selectors (`ATTRIBUTE_SELECTORS`, `STRUCTURED_META_SELECTOR`)
- Regex patterns (exported as functions to avoid shared state: `createEmailGlobalRegex()`)

### Regex State Management
**Critical**: Use factory functions for global regexes to prevent `lastIndex` bugs:
```javascript
export function createEmailGlobalRegex() {
  return new RegExp(EMAIL_PATTERN, "g");
}
```
Always reset `lastIndex` before using: `EMAIL_GLOBAL_REGEX.lastIndex = 0;`

## Integration Points

- **node-html-parser**: HTML parsing library (only production dependency)
- **Global fetch**: Accepts custom fetch implementations via options (enables testing with mocks)
- **AbortSignal**: Supports request cancellation via `options.signal`

## Common Pitfalls

1. **Adding new email sources**: Update `SOURCE_WEIGHT` in `constants.js` AND add extraction logic in `extract-candidates.js`
2. **Regex changes**: Test against real-world cases in `test/integration.test.js` (phone number concatenation, mixed-case TLDs)
3. **Import extensions**: Always include `.js` in relative imports (ESM requirement)
4. **Contact page limits**: `discoverContactPages()` caps at 5 URLs to prevent abuse
