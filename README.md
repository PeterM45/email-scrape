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
// Automatically checks contact/about pages for more emails
const ranked = await scrapeEmailsFromWebsite("https://example.com");

// Skip contact page discovery for faster scraping
const main = await scrapeEmailsFromWebsite("https://example.com", {
	followContactPages: false,
});

// Convenience helper returning the single highest-ranked email
const top = await scrapeEmailFromWebsite("https://example.com");
```

## Features

- **Smart email validation**: Rejects malformed emails and text that looks like emails but isn't properly formatted
- **Contact page discovery**: Automatically finds and scrapes `/contact`, `/about`, and similar pages for additional email addresses
- **Ranked results**: Returns emails sorted by source quality (mailto links ranked highest, then structured data, then plain text)
- **Keyword boosting**: Emails containing keywords like "support", "contact", "info" get higher rankings

### Options

`scrapeEmailsFromWebsite(url, options)`

- `fetch`: custom fetch implementation (defaults to global `fetch`).
- `signal`: abort signal to cancel the request.
- `userAgent`: override the default user-agent string.
- `headers`: additional headers to merge with defaults.
- `followContactPages`: if true (default), automatically discovers and scrapes contact/about pages for additional emails.

## Scripts

```bash
pnpm clean    # remove dist/coverage artifacts
pnpm lint     # run Biome linting
pnpm test     # execute node test runner
pnpm release  # publish using changesets
```

## Publishing

The project uses [Changesets](https://github.com/changesets/changesets) for version management and **npm provenance** for secure, transparent publishing.

### Automated Publishing (Recommended)

1. **One-time setup** (if you haven't already):
   - Go to [npmjs.com](https://www.npmjs.com/) → Account Settings → Access Tokens
   - Create a new **Automation** token (granular access token with publish permission)
   - In your GitHub repo: Settings → Secrets and variables → Actions → New repository secret
   - Name it `NPM_TOKEN` and paste your token
   - The workflow now uses this with npm provenance for secure publishing

2. **To publish a new version**:
   ```bash
   pnpm changeset  # Describe your changes and choose semver bump (patch/minor/major)
   git add .changeset/*
   git commit -m "Add changeset for new feature"
   git push
   ```

3. The CI workflow automatically:
   - Detects the changeset
   - Bumps the version in `package.json`
   - Publishes to npm with cryptographic provenance
   - Pushes version commits and tags back to the repo

### Manual Publishing (if needed)

```bash
pnpm changeset version  # Bump version
pnpm install            # Update lockfile
pnpm test               # Run tests
pnpm release            # Publish to npm
```

## Development

```bash
pnpm install
pnpm lint
pnpm test
```

## License

MIT

