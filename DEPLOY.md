# Deployment

How to host your own XBlock server and ship an extension build that talks to it.

## Overview

```
Chrome extension  --HTTPS-->  your domain  -->  reverse proxy (TLS)
                                                └─ Docker: server/ (Express + Prisma)
                                                   └─ SQLite on a persistent volume
```

- **Extension:** `chrome_extension/`. Webpack builds `chrome_extension/src/` into `chrome_extension/dist/` for local work (always against a local server), and into `chrome_extension/release/build/` for the store.
- **API server:** `server/`, Node + Express + Prisma + SQLite, built from `server/Dockerfile`.

Any Docker host works (Coolify, Dokku, plain `docker run` behind Caddy or Traefik, ...).

## Running the server

- **Build:** `server/Dockerfile`, with `server/` as the build context. The container listens on port `3000` and answers `GET /health` with `{"status":"ok"}`.
- **Persistent storage:** mount a volume at `/data`. The database is `/data/xblock.db`. Without the volume, every redeploy wipes the database.
- **Migrations** run automatically on start (`prisma migrate deploy`).

### Environment variables

| Variable | Purpose |
| --- | --- |
| `XBLOCK_SECRET` | Turns each user's token into their user ID (HMAC). At least 32 random characters. **Never change or lose it:** every user would end up on a new, empty account. Back it up somewhere safe. |
| `ALLOWED_ORIGINS` | Extension origins allowed to call the API (CORS), comma-separated, e.g. `chrome-extension://<your extension id>`. Only the store build needs to be here: `dist/` builds talk to a local server. |
| `ADMIN_TOKEN` | Optional. Enables the `/admin` endpoints (usage stats, curated lists owned by the server). At least 32 random characters. If unset, `/admin` answers 404. |
| `DATABASE_URL`, `HOST`, `PORT`, `TRUST_PROXY` | Set in the Dockerfile (`file:/data/xblock.db`, `0.0.0.0`, `3000`, `1`). Set `TRUST_PROXY` to the number of proxies in front of the server. |

Generate a secret with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Schema changes

Edit `server/prisma/schema.prisma`, run `npm --prefix server run db:migrate` locally, commit the new migration, then redeploy.

### Backing up the database

The SQLite file lives in the Docker volume. Copy it out regularly, for example:

```sh
docker run --rm -v <volume name>:/data -v "$PWD":/backup alpine \
  cp /data/xblock.db /backup/xblock-$(date +%F).db
```

## Releasing the extension

1. Bump `version` in `chrome_extension/src/manifest.json` (it must be higher than the published one).
2. Run `npm run package`. It builds into `chrome_extension/release/build/` (never `dist/`) and writes `chrome_extension/release/xblock-<version>.zip`.
   - The build talks to the official server by default. To use your own: `XBLOCK_API_URL=https://your-domain npm run package`.
   - Release builds refuse plain `http://` URLs.
3. Upload the zip in the Chrome Web Store developer dashboard.

Rules that keep store updates painless:

- **Don't add `host_permissions`** (or any new permission) to the manifest. New permission warnings make Chrome disable the extension for existing users until they re-approve. The server answers CORS instead (`ALLOWED_ORIGINS`).
- **Don't obfuscate the code.** The Web Store rejects obfuscated code; the release build is minified only.

## Local development

See `README.md`. In short:

- Start the local server: `npm run server:setup` (first time only), then `npm run server`.
- Build the extension: `npm run build`. It uses `http://localhost:3000` by default.
- Load `chrome_extension/dist/` unpacked in `chrome://extensions`. It only ever talks to your local server: a `dist/` build aimed anywhere else stops with an error.
