# XBlock

XBlock is an app that enables fast and efficient blocking on X (formerly Twitter). It allows users to create and share blocklists, letting subscribers automatically block all accounts from the list. Ideal for community moderation and personalized safety control.

## Features
- **Fast Blocking**: Quickly block unwanted accounts with one click.
- **Shared Blocklists**: Create and share blocklists with others.
- **Auto-Blocking**: Subscribers automatically block all accounts from the subscribed list.
- **Privacy & Safety**: Enhance your online experience by avoiding unwanted interactions.

## Installation
1. Install XBlock from the [Chrome Web Store](https://chromewebstore.google.com/detail/xblock/mabmaplbljlpcabbdioomjilodkhaajj).
2. Add users to your block list and/or subscribe to an existing blocklist using a share code.

## How It Works
1. **Create a Blocklist**: Add accounts you want to block (through X website).
2. **Share**: Share your blocklist code with others.
3. **Subscribe**: Users who subscribe automatically block accounts from the list.

## Development
XBlock stores its data in a local SQLite database managed by [Prisma](https://www.prisma.io/), served by a small Express API in `server/`. The extension's background worker talks to it at `http://localhost:3000`.

1. Set up the server (first time only):
   ```sh
   cp server/.env.example server/.env   # then set XBLOCK_SECRET
   npm run server:setup                 # installs deps and creates the database
   ```
2. Start the server: `npm run server`
3. Build the extension: `npm run build`, then load `chrome_extension/dist/` as an unpacked extension. `dist/` always talks to your local server; store builds come from `npm run package`.

Schema changes go in `server/prisma/schema.prisma`; run `npm --prefix server run db:migrate` to create a migration, and `npm --prefix server run db:studio` to browse the data.

To test subscriptions or batch blocking locally, create a list owned by someone else with `npm --prefix server run seed:list -- handle1 handle2 ...` and subscribe to the printed share code.

Translations live in `chrome_extension/src/_locales/<lang>/messages.json` (English is the default; French, Spanish, German, Japanese, Brazilian Portuguese and Indonesian are included); Chrome picks the language from the browser settings. In code, use `i18n("key", ...)`; in `popup.html`, tag elements with `data-i18n`, `data-i18n-placeholder` or `data-i18n-tooltip`. To add a language, copy `en/messages.json` to a new folder and translate the `message` values.

Hosting your own server and releasing the extension are documented in [DEPLOY.md](DEPLOY.md).

The website's text lives in `website/lib/dictionaries/<lang>.ts`, one file per language, all the same shape as `en.ts`; `node website/scripts/check-dictionary.cjs` checks them. The Chrome Web Store images and listings for every language are in `media/store/<lang>/`, rendered from the website by `media/store/render.cjs`.

The public website lives in `website/` (Next.js, Tailwind and shadcn/ui). Run it with `npm --prefix website install` then `npm --prefix website run dev`; `website/Dockerfile` builds it for production.

## Contributing
Want to help improve XBlock? Issues and pull requests are welcome.

## License
XBlock is released under the [MIT License](LICENSE).

## Contact
For support or inquiries, reach out to xblock.extension@gmail.com
