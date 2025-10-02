---
"email-scrape": minor
---

Major improvements to email extraction and validation:

- Add TypeScript declaration files for better IDE support and type safety
- Significantly improve email validation to reject malformed emails (fixes issue with text like '878-5717info@example.com')
- Add automatic contact page discovery - now scrapes /contact, /about, and similar pages for additional emails
- Add `followContactPages` option to control contact page scraping behavior (defaults to true)
- Enhance email regex with proper word boundaries and validation
- Add comprehensive tests for email validation and contact page discovery

