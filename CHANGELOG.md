# email-scrape

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
