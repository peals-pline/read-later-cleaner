# Contributing

Thanks for helping improve ReadLaterCleaner.

## Guidelines

- Keep the extension local-first and privacy-friendly.
- Do not add analytics, accounts, tracking, or remote sync to the MVP.
- Request the smallest browser permissions possible.
- Keep popup, options UI, domain logic, storage, and extension APIs separated.
- Include screenshots for visible UI changes.
- Add tests for storage, filtering, duplicate detection, or export behavior when
  changing those areas.

## Local setup

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Load the generated `dist` folder through `chrome://extensions` to test the
extension in a browser.

