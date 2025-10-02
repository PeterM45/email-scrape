# email-scrape

Toolkit for extracting email addresses from HTML content and remote websites.

## Installation

```bash
pnpm add email-scrape
```

## Usage

```js
import {
	scrapeEmailsFromWebsite,
	scrapeEmailFromWebsite,
	extractEmails,
} from "email-scrape";

// Extract emails from a string
const emails = extractEmails("Contact us at hello@example.com");

// Fetch a webpage and return ranked list of emails
const ranked = await scrapeEmailsFromWebsite("https://example.com");

// Convenience helper returning the single highest-ranked email
const top = await scrapeEmailFromWebsite("https://example.com");
```

### Options

`scrapeEmailsFromWebsite(url, options)`

- `fetch`: custom fetch implementation (defaults to global `fetch`).
- `signal`: abort signal to cancel the request.
- `userAgent`: override the default user-agent string.
- `headers`: additional headers to merge with defaults.

## Scripts

```bash
pnpm clean    # remove dist/coverage artifacts
pnpm lint     # run Biome linting
pnpm test     # execute node test runner
pnpm release  # publish using changesets (requires NPM_TOKEN)
```

## Publishing

1. Run `pnpm changeset` to create a release note describing the change (choose semver bump).
2. Merge the generated changeset PR (or commit) into `main`.
3. Ensure `NPM_TOKEN` is configured in GitHub repository secrets.
4. Push to `main`; the CI workflow runs tests and, on success, versions and publishes via Changesets.

If you prefer to publish locally:

```bash
export NPM_TOKEN=... # with publish rights
pnpm changeset version
pnpm install
pnpm test
pnpm release
```

## Development

```bash
pnpm install
pnpm lint
pnpm test
```

## License

MIT

