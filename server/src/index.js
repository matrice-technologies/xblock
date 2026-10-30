require("dotenv").config({ quiet: true });

const crypto = require("crypto");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { PrismaClient, Prisma } = require("@prisma/client");
const { randomAnimal } = require("./randomName");

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3000;
// Local default stays off the LAN; the Docker image sets HOST=0.0.0.0 for the reverse proxy
const HOST = process.env.HOST || "127.0.0.1";
const SECRET = process.env.XBLOCK_SECRET;
if (!SECRET || SECRET.length < 32 || SECRET === "change-me") {
  console.error("XBLOCK_SECRET must be set to a random string of at least 32 characters (see server/.env.example)");
  process.exit(1);
}

// Only trust X-Forwarded-For when actually behind a proxy (Coolify/Traefik), otherwise
// clients could spoof their IP and dodge the rate limits
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

const LIMITS = {
  usernamesPerRequest: 500,
  usernameLength: 64,
  bannedUsersPerList: 50000,
  whitelistedUsers: 10000,
  subscriptions: 200,
  nameLength: 80,
};
// blur / hide: only on the subscriber's screen; autoblock / automute: block or mute on X
const SUBSCRIPTION_MODES = ["blur", "hide", "autoblock", "automute"];
const X_MODES = ["autoblock", "automute"];
// New subscriptions block the list's accounts on X unless the client asks for another mode
const DEFAULT_SUBSCRIPTION_MODE = "autoblock";
// "muted": the user chose to mute accounts on X rather than block them
const BLOCK_STATUSES = ["blocked", "muted", "unavailable"];
const X_HANDLE_PATTERN = /^@?([A-Za-z0-9_]{1,50})$/;
// Larger than any real account, so a bogus report can't be stored
const MAX_FOLLOWERS = 5_000_000_000;
const PRIVACY_VALUES = ["public", "private"];
// Tokens are crypto.randomUUID() values; reject short guessable ones
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,128}$/;

// Enables /admin (curated list syncs). Unset = /admin answers 404.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (ADMIN_TOKEN && ADMIN_TOKEN.length < 32) {
  console.error("ADMIN_TOKEN must be at least 32 characters (see server/.env.example)");
  process.exit(1);
}
// Owner of the lists created through /admin; the user row is created on first sync
const CURATOR_USER_ID = "xblock-curator";
const BANLIST_CODE_PATTERN = /^[0-9A-F]{3,8}$/;
const DETAIL_LENGTH = 300;

// Only the extension may call the API from a browser. Answering CORS (instead of asking for
// host_permissions in the manifest) means store updates don't trigger a new permission prompt.
// Unset = any extension origin, which is fine for local development.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.length === 0) return origin.startsWith("chrome-extension://");
  return ALLOWED_ORIGINS.includes(origin);
}

app.disable("x-powered-by");

app.use((req, res, next) => {
  const origin = req.get("Origin");
  res.vary("Origin");
  if (isAllowedOrigin(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    if (req.method === "OPTIONS") {
      res.set({
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400",
      });
      return res.sendStatus(204);
    }
  }
  next();
});

// Curated list syncs send thousands of accounts at once; parsed first, so the 64kb parser skips them
app.use("/admin", express.json({ limit: "5mb" }));
app.use(express.json({ limit: "64kb" }));

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// The extension holds a random token; we only ever store its HMAC as the user id
function hmacUid(token) {
  return crypto.createHmac("sha256", SECRET).update(token).digest("hex");
}

function generateBanlistCode() {
  return crypto.randomInt(0x100000).toString(16).toUpperCase().padStart(5, "0");
}

function cleanUsernames(userIds) {
  if (!Array.isArray(userIds)) throw new HttpError(400, "userIds must be an array");
  if (userIds.length > LIMITS.usernamesPerRequest) {
    throw new HttpError(400, `At most ${LIMITS.usernamesPerRequest} users per request`);
  }
  const usernames = [...new Set(userIds)];
  if (usernames.some((u) => typeof u !== "string" || u.length === 0 || u.length > LIMITS.usernameLength)) {
    throw new HttpError(400, "Invalid username");
  }
  return usernames;
}

// X handles are case-insensitive; stats and blocks are keyed by the lowercased handle
function normalizeHandle(value) {
  const match = typeof value === "string" ? value.trim().match(X_HANDLE_PATTERN) : null;
  return match ? match[1].toLowerCase() : null;
}

function cleanFollowersCount(value) {
  return Number.isInteger(value) && value >= 0 && value <= MAX_FOLLOWERS ? value : undefined;
}

function requireArray(value, name) {
  if (!Array.isArray(value)) throw new HttpError(400, `${name} must be an array`);
  if (value.length > LIMITS.usernamesPerRequest) {
    throw new HttpError(400, `At most ${LIMITS.usernamesPerRequest} ${name} per request`);
  }
  return value;
}

function validateFields(body, validators) {
  const data = {};
  for (const [key, isValid] of Object.entries(validators)) {
    if (body?.[key] === undefined) continue;
    if (!isValid(body[key])) throw new HttpError(400, `Invalid ${key}`);
    data[key] = body[key];
  }
  return data;
}

const isShortString = (max) => (v) => typeof v === "string" && v.length <= max;
const isOneOf = (values) => (v) => values.includes(v);

// --- Serialisation: keep the same shape the extension used with Firestore ---

const userInclude = {
  whitelist: { orderBy: { createdAt: "asc" } },
  subscriptions: { orderBy: { createdAt: "asc" } },
};

const banlistInclude = {
  bannedUsers: { orderBy: { createdAt: "asc" } },
};

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    enableAnimation: user.enableAnimation,
    hidingMethod: user.hidingMethod,
    createdAt: user.createdAt,
    lastConnection: user.lastConnection,
    whiteListedUsers: user.whitelist.map((w) => w.username),
    subscriptions: user.subscriptions.map((s) => ({ blockListId: s.banlistId, mode: s.mode })),
  };
}

function serializeBanlist(banlist, followers = {}) {
  return {
    id: banlist.id,
    code: banlist.id,
    name: banlist.name,
    privacy: banlist.privacy,
    ownerId: banlist.ownerId,
    bannedUsers: banlist.bannedUsers.map((b) => b.username),
    // Known follower counts, keyed by the username as it appears in bannedUsers
    bannedUserFollowers: followers,
  };
}

async function loadFollowersByBanlist(banlistIds) {
  if (banlistIds.length === 0) return {};
  const rows = await prisma.$queryRaw`
    SELECT b.banlistId, b.username, a.followersCount
    FROM BannedUser b
    JOIN XAccount a ON a.username = lower(b.username)
    WHERE b.banlistId IN (${Prisma.join(banlistIds)}) AND a.followersCount IS NOT NULL`;
  const byBanlist = {};
  for (const row of rows) {
    (byBanlist[row.banlistId] ??= {})[row.username] = Number(row.followersCount);
  }
  return byBanlist;
}

async function loadUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: userInclude });
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

async function loadOwnedBanlist(banlistId, userId) {
  const banlist = await prisma.banlist.findUnique({ where: { id: banlistId } });
  if (!banlist) throw new HttpError(404, "Banlist not found");
  if (banlist.ownerId !== userId) throw new HttpError(403, "Not authorized");
  return banlist;
}

async function createBanlist(ownerId, privacy) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generateBanlistCode();
    const exists = await prisma.banlist.findUnique({ where: { id } });
    if (exists) continue;
    return prisma.banlist.create({
      data: { id, ownerId, privacy, name: randomAnimal() + " Block List" },
    });
  }
  throw new HttpError(500, "Could not generate a unique banlist code");
}

// --- Rate limiting ---

const limiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ message }),
  });

const apiLimiter = limiter(60 * 1000, 300, "Too many requests, slow down");
// Sessions create accounts, so they get a much tighter budget
const sessionLimiter = limiter(60 * 60 * 1000, 30, "Too many sign-ins, try again later");
// Subscribing by code is how someone would brute-force share codes
const subscribeLimiter = limiter(60 * 1000, 20, "Too many subscription attempts, try again later");

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- Admin: curated lists ---

const adminLimiter = limiter(15 * 60 * 1000, 30, "Too many admin requests, try again later");

app.use("/admin", adminLimiter, (req, res, next) => {
  if (!ADMIN_TOKEN) return next(new HttpError(404, "Not found"));
  const header = req.get("Authorization") || "";
  const token = Buffer.from(header.startsWith("Bearer ") ? header.slice(7).trim() : "");
  const expected = Buffer.from(ADMIN_TOKEN);
  if (token.length !== expected.length || !crypto.timingSafeEqual(token, expected)) {
    return next(new HttpError(401, "Not authorized"));
  }
  next();
});

// Usage numbers for the owner (real users only: the curator and seed:list owners are left out)
app.get("/admin/stats", async (req, res) => {
  const day = 24 * 60 * 60 * 1000;
  const since = (days) => new Date(Date.now() - days * day);
  const realUsers = { id: { not: CURATOR_USER_ID }, NOT: { id: { startsWith: "seed-" } } };
  const count = (where) => prisma.user.count({ where: { ...realUsers, ...where } });

  const [total, new24h, new7d, active24h, active7d, signupRows, listRows, blocks] = await Promise.all([
    count({}),
    count({ createdAt: { gte: since(1) } }),
    count({ createdAt: { gte: since(7) } }),
    count({ lastConnection: { gte: since(1) } }),
    count({ lastConnection: { gte: since(7) } }),
    prisma.$queryRaw`
      SELECT date(createdAt / 1000, 'unixepoch') AS day, COUNT(*) AS users
      FROM User
      WHERE id != ${CURATOR_USER_ID} AND id NOT LIKE 'seed-%' AND createdAt >= ${since(14).getTime()}
      GROUP BY day ORDER BY day`,
    prisma.$queryRaw`
      SELECT s.banlistId AS id, b.name, COUNT(*) AS subscribers,
             SUM(CASE WHEN s.mode = 'autoblock' THEN 1 ELSE 0 END) AS blockMode,
             SUM(CASE WHEN s.mode = 'automute' THEN 1 ELSE 0 END) AS muteMode
      FROM Subscription s JOIN Banlist b ON b.id = s.banlistId
      GROUP BY s.banlistId ORDER BY subscribers DESC LIMIT 20`,
    prisma.userBlock.count({ where: { status: "blocked" } }),
  ]);

  res.json({
    users: { total, new24h, new7d, active24h, active7d },
    signupsByDay: signupRows.map((r) => ({ day: r.day, users: Number(r.users) })),
    topLists: listRows.map((r) => ({ id: r.id, name: r.name, subscribers: Number(r.subscribers), blockMode: Number(r.blockMode), muteMode: Number(r.muteMode) })),
    blocksRecorded: blocks,
  });
});

const cleanDetail = (value) => (typeof value === "string" && value.trim() ? value.trim().slice(0, DETAIL_LENGTH) : null);

// Creates or syncs a curated list under a fixed share code: adds new accounts, refreshes their
// name/note, and with removeMissing drops the ones the source no longer lists.
// Handles are deduplicated case-insensitively; dryRun reports the diff without writing.
app.put("/admin/banlists/:id", async (req, res) => {
  const id = req.params.id.toUpperCase();
  if (!BANLIST_CODE_PATTERN.test(id)) throw new HttpError(400, "Share codes are 3 to 8 hex digits");
  const { name, privacy = "public", removeMissing = false, dryRun = false } = req.body ?? {};
  if (!isShortString(LIMITS.nameLength)(name) || !name.trim()) throw new HttpError(400, "Invalid name");
  if (!PRIVACY_VALUES.includes(privacy)) throw new HttpError(400, "Invalid privacy");
  if (!Array.isArray(req.body?.accounts)) throw new HttpError(400, "accounts must be an array");
  if (req.body.accounts.length > LIMITS.bannedUsersPerList) throw new HttpError(400, "Too many accounts");

  const incoming = new Map();
  for (const account of req.body.accounts) {
    const handle = typeof account?.username === "string" ? account.username.trim().replace(/^@/, "") : "";
    if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) throw new HttpError(400, `Invalid username: ${String(account?.username)}`);
    const key = handle.toLowerCase();
    if (!incoming.has(key)) incoming.set(key, { username: handle, name: cleanDetail(account.name), note: cleanDetail(account.note) });
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const banlist = await tx.banlist.findUnique({ where: { id } });
      if (banlist && banlist.ownerId !== CURATOR_USER_ID) throw new HttpError(409, `XBK-${id} belongs to a user`);

      const existing = banlist ? await tx.bannedUser.findMany({ where: { banlistId: id } }) : [];
      const existingByKey = new Map(existing.map((b) => [b.username.toLowerCase(), b]));
      const toAdd = [...incoming.entries()].filter(([key]) => !existingByKey.has(key)).map(([, a]) => a);
      const toUpdate = existing.filter((b) => {
        const a = incoming.get(b.username.toLowerCase());
        return a && (a.name !== b.name || a.note !== b.note);
      });
      const toRemove = removeMissing ? existing.filter((b) => !incoming.has(b.username.toLowerCase())) : [];
      const total = existing.length + toAdd.length - toRemove.length;
      const summary = { id, created: !banlist, added: toAdd.length, updated: toUpdate.length, removed: toRemove.length, total };
      if (dryRun) return { ...summary, dryRun: true, removedUsernames: toRemove.map((b) => b.username) };

      await tx.user.upsert({ where: { id: CURATOR_USER_ID }, create: { id: CURATOR_USER_ID, name: "XBlock" }, update: {} });
      await tx.banlist.upsert({ where: { id }, create: { id, name, privacy, ownerId: CURATOR_USER_ID }, update: { name, privacy } });
      if (toAdd.length) await tx.bannedUser.createMany({ data: toAdd.map((a) => ({ banlistId: id, ...a })) });
      for (const b of toUpdate) {
        const { name, note } = incoming.get(b.username.toLowerCase());
        await tx.bannedUser.update({ where: { banlistId_username: { banlistId: id, username: b.username } }, data: { name, note } });
      }
      if (toRemove.length) {
        await tx.bannedUser.deleteMany({ where: { banlistId: id, username: { in: toRemove.map((b) => b.username) } } });
      }
      return { ...summary, removedUsernames: toRemove.map((b) => b.username) };
    },
    { timeout: 120000 }
  );
  res.json(result);
});

// --- Auth ---

app.use("/api", apiLimiter, (req, res, next) => {
  const header = req.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!TOKEN_PATTERN.test(token)) return next(new HttpError(401, "User not authenticated"));
  req.userId = hmacUid(token);
  next();
});

// Creates the user (and their own banlist) on first sign-in
app.post("/api/session", sessionLimiter, async (req, res) => {
  const userId = req.userId;
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    await prisma.user.create({ data: { id: userId } });
    await createBanlist(userId, "public");
  }
  await prisma.user.update({ where: { id: userId }, data: { lastConnection: new Date() } });
  res.json({ user: serializeUser(await loadUser(userId)) });
});

// --- User ---

app.get("/api/me", async (req, res) => {
  res.json({ user: serializeUser(await loadUser(req.userId)) });
});

app.patch("/api/me", async (req, res) => {
  await loadUser(req.userId);
  const data = validateFields(req.body, {
    name: isShortString(LIMITS.nameLength),
    email: isShortString(254),
    enableAnimation: (v) => typeof v === "boolean",
    hidingMethod: isShortString(32),
  });
  await prisma.user.update({ where: { id: req.userId }, data });
  res.json({ user: serializeUser(await loadUser(req.userId)) });
});

app.post("/api/me/whitelist", async (req, res) => {
  const usernames = cleanUsernames(req.body?.userIds);
  await prisma.$transaction(async (tx) => {
    const existing = await tx.whitelistedUser.findMany({
      where: { userId: req.userId, username: { in: usernames } },
    });
    const known = new Set(existing.map((w) => w.username));
    const toAdd = usernames.filter((u) => !known.has(u));
    if (toAdd.length === 0) return;

    const count = await tx.whitelistedUser.count({ where: { userId: req.userId } });
    if (count + toAdd.length > LIMITS.whitelistedUsers) {
      throw new HttpError(400, `Whitelist is limited to ${LIMITS.whitelistedUsers} users`);
    }
    await tx.whitelistedUser.createMany({
      data: toAdd.map((username) => ({ userId: req.userId, username })),
    });
  });
  res.json({ status: "success" });
});

app.delete("/api/me/whitelist", async (req, res) => {
  const usernames = cleanUsernames(req.body?.userIds);
  await prisma.whitelistedUser.deleteMany({
    where: { userId: req.userId, username: { in: usernames } },
  });
  res.json({ status: "success" });
});

// --- Banlists ---

// Banlists the user owns plus the ones they are subscribed to
app.get("/api/banlists", async (req, res) => {
  const banlists = await prisma.banlist.findMany({
    where: {
      OR: [{ ownerId: req.userId }, { subscriptions: { some: { userId: req.userId } } }],
    },
    include: banlistInclude,
    orderBy: { createdAt: "asc" },
  });
  const followers = await loadFollowersByBanlist(banlists.map((b) => b.id));
  res.json({ banlists: banlists.map((b) => serializeBanlist(b, followers[b.id])) });
});

// Browsing a list: its accounts with context, follower counts and this user's block status.
// Only for the owner and subscribers, so a private list stays private.
app.get("/api/banlists/:id/accounts", async (req, res) => {
  const banlistId = req.params.id;
  const banlist = await prisma.banlist.findUnique({ where: { id: banlistId } });
  const subscribed = banlist && (await prisma.subscription.findUnique({
    where: { userId_banlistId: { userId: req.userId, banlistId } },
  }));
  if (!banlist || (banlist.ownerId !== req.userId && !subscribed)) throw new HttpError(404, "Banlist not found");

  const rows = await prisma.$queryRaw`
    SELECT b.username, b.name, b.note, a.followersCount, ub.status,
           EXISTS (SELECT 1 FROM WhitelistedUser w WHERE w.userId = ${req.userId}
                   AND lower(w.username) = lower(b.username)) AS whitelisted
    FROM BannedUser b
    LEFT JOIN XAccount a ON a.username = lower(b.username)
    LEFT JOIN UserBlock ub ON ub.userId = ${req.userId} AND ub.username = lower(b.username)
    WHERE b.banlistId = ${banlistId}
    ORDER BY a.followersCount IS NULL, a.followersCount DESC, lower(b.username)`;
  res.json({
    accounts: rows.map((r) => ({
      username: r.username,
      name: r.name,
      note: r.note,
      followersCount: r.followersCount === null ? null : Number(r.followersCount),
      status: r.status,
      whitelisted: Boolean(Number(r.whitelisted)),
    })),
  });
});

app.patch("/api/banlists/:id", async (req, res) => {
  await loadOwnedBanlist(req.params.id, req.userId);
  const data = validateFields(req.body, {
    name: isShortString(LIMITS.nameLength),
    privacy: isOneOf(PRIVACY_VALUES),
  });
  const banlist = await prisma.banlist.update({
    where: { id: req.params.id },
    data,
    include: banlistInclude,
  });
  res.json({ banlist: serializeBanlist(banlist) });
});

app.post("/api/banlists/:id/banned-users", async (req, res) => {
  const banlistId = req.params.id;
  await loadOwnedBanlist(banlistId, req.userId);
  const usernames = cleanUsernames(req.body?.userIds);
  await prisma.$transaction(async (tx) => {
    const existing = await tx.bannedUser.findMany({
      where: { banlistId, username: { in: usernames } },
    });
    const known = new Set(existing.map((b) => b.username));
    const toAdd = usernames.filter((u) => !known.has(u));
    if (toAdd.length === 0) return;

    const count = await tx.bannedUser.count({ where: { banlistId } });
    if (count + toAdd.length > LIMITS.bannedUsersPerList) {
      throw new HttpError(400, `Block lists are limited to ${LIMITS.bannedUsersPerList} users`);
    }
    await tx.bannedUser.createMany({
      data: toAdd.map((username) => ({ banlistId, username })),
    });
  });
  res.json({ status: "success" });
});

app.delete("/api/banlists/:id/banned-users", async (req, res) => {
  const banlistId = req.params.id;
  await loadOwnedBanlist(banlistId, req.userId);
  const usernames = cleanUsernames(req.body?.userIds);
  await prisma.bannedUser.deleteMany({ where: { banlistId, username: { in: usernames } } });
  res.json({ status: "success" });
});

// --- Subscriptions ---

app.put("/api/subscriptions/:banlistId", subscribeLimiter, async (req, res) => {
  const { banlistId } = req.params;
  const { mode = DEFAULT_SUBSCRIPTION_MODE } = validateFields(req.body, { mode: isOneOf(SUBSCRIPTION_MODES) });

  await loadUser(req.userId);
  const banlist = await prisma.banlist.findUnique({
    where: { id: banlistId },
    include: banlistInclude,
  });
  // A private list looks exactly like a missing one to anyone but its owner
  if (!banlist || (banlist.privacy === "private" && banlist.ownerId !== req.userId)) {
    throw new HttpError(404, "Banlist not found");
  }

  const key = { userId_banlistId: { userId: req.userId, banlistId } };
  const alreadySubscribed = await prisma.subscription.findUnique({ where: key });
  if (!alreadySubscribed) {
    const count = await prisma.subscription.count({ where: { userId: req.userId } });
    if (count >= LIMITS.subscriptions) {
      throw new HttpError(400, `You can subscribe to at most ${LIMITS.subscriptions} block lists`);
    }
  }

  await prisma.subscription.upsert({
    where: key,
    create: { userId: req.userId, banlistId, mode },
    update: { mode },
  });
  res.json({ blockList: serializeBanlist(banlist) });
});

app.delete("/api/subscriptions/:banlistId", async (req, res) => {
  const { banlistId } = req.params;
  const banlist = await prisma.banlist.findUnique({ where: { id: banlistId } });
  if (!banlist) throw new HttpError(404, "Banlist not found");

  await prisma.subscription.deleteMany({ where: { userId: req.userId, banlistId } });
  res.json({ status: "success" });
});

// --- X accounts: follower counts and blocks ---

async function saveFollowersCount(tx, username, followersCount) {
  if (followersCount === undefined) return;
  await tx.xAccount.upsert({
    where: { username },
    create: { username, followersCount },
    update: { followersCount },
  });
}

// Account stats the extension saw in X's own responses while the user browsed.
// `blocking` and `muting` are from this user's point of view, so they also keep their UserBlocks
// accurate. A block wins over a mute.
app.post("/api/accounts/observed", async (req, res) => {
  const accounts = requireArray(req.body?.accounts, "accounts")
    .map((a) => ({
      username: normalizeHandle(a?.username),
      followersCount: cleanFollowersCount(a?.followersCount),
      blocking: typeof a?.blocking === "boolean" ? a.blocking : undefined,
      muting: typeof a?.muting === "boolean" ? a.muting : undefined,
    }))
    .filter((a) => a.username);

  await prisma.$transaction(
    async (tx) => {
      for (const { username, followersCount, blocking, muting } of accounts) {
        await saveFollowersCount(tx, username, followersCount);
        const key = { userId_username: { userId: req.userId, username } };
        if (blocking === true) {
          await tx.userBlock.upsert({
            where: key,
            create: { userId: req.userId, username, status: "blocked" },
            update: { status: "blocked" },
          });
        } else if (blocking === false) {
          await tx.userBlock.deleteMany({ where: { userId: req.userId, username, status: "blocked" } });
        }
        if (blocking !== true && muting === true) {
          const existing = await tx.userBlock.findUnique({ where: key });
          if (!existing || existing.status !== "blocked") {
            await tx.userBlock.upsert({
              where: key,
              create: { userId: req.userId, username, status: "muted" },
              update: { status: "muted" },
            });
          }
        } else if (muting === false) {
          await tx.userBlock.deleteMany({ where: { userId: req.userId, username, status: "muted" } });
        }
      }
    },
    { timeout: 15000 }
  );
  res.json({ status: "success" });
});

// Blocks the extension just performed on X (or found impossible), with the follower count if known
app.post("/api/blocks", async (req, res) => {
  const blocks = requireArray(req.body?.blocks, "blocks").map((b) => {
    const username = normalizeHandle(b?.username);
    const status = b?.status ?? "blocked";
    if (!username) throw new HttpError(400, "Invalid username");
    if (!BLOCK_STATUSES.includes(status)) throw new HttpError(400, "Invalid status");
    return { username, status, followersCount: cleanFollowersCount(b?.followersCount) };
  });

  await prisma.$transaction(
    async (tx) => {
      for (const { username, status, followersCount } of blocks) {
        await saveFollowersCount(tx, username, followersCount);
        await tx.userBlock.upsert({
          where: { userId_username: { userId: req.userId, username } },
          create: { userId: req.userId, username, status },
          update: { status },
        });
      }
    },
    { timeout: 15000 }
  );
  res.json({ status: "success" });
});

// Batch blocking: progress for every subscribed list that acts on X (Block or Mute mode), plus
// the next accounts to handle across all of them (each account once, most followers first, unknown
// counts last). An account is done for a Block list once blocked (or unavailable), for a Mute list
// once muted, blocked or unavailable; it is blocked if any of its pending lists says Block.
app.get("/api/batch-block", async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? "100", 10) || 0, 0), 200);
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: req.userId, mode: { in: X_MODES } },
    include: { banlist: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (subscriptions.length === 0) return res.json({ lists: [], queue: [], remaining: 0 });

  const fromLists = Prisma.sql`
    FROM BannedUser b
    JOIN Subscription s ON s.userId = ${req.userId} AND s.banlistId = b.banlistId AND s.mode IN (${Prisma.join(X_MODES)})
    LEFT JOIN UserBlock ub ON ub.userId = ${req.userId} AND ub.username = lower(b.username)`;
  const notWhitelisted = Prisma.sql`lower(b.username) NOT IN (
    SELECT lower(w.username) FROM WhitelistedUser w WHERE w.userId = ${req.userId})`;
  // COALESCE: a NULL here (no UserBlock yet) would make NOT isDone NULL too, and drop the row
  const isDone = Prisma.sql`(COALESCE(ub.status, '') IN ('blocked', 'unavailable') OR (COALESCE(ub.status, '') = 'muted' AND s.mode = 'automute'))`;

  const [progress, queue, [{ remaining }]] = await Promise.all([
    prisma.$queryRaw`
      SELECT b.banlistId AS id, COUNT(*) AS total, SUM(CASE WHEN ${isDone} THEN 1 ELSE 0 END) AS done
      ${fromLists}
      WHERE ${notWhitelisted}
      GROUP BY b.banlistId`,
    limit === 0
      ? []
      : prisma.$queryRaw`
      SELECT lower(b.username) AS username,
             MAX(a.followersCount) AS followersCount,
             group_concat(DISTINCT b.banlistId) AS lists,
             MAX(CASE WHEN s.mode = 'autoblock' THEN 1 ELSE 0 END) AS block
      ${fromLists}
      LEFT JOIN XAccount a ON a.username = lower(b.username)
      WHERE ${notWhitelisted} AND NOT ${isDone}
      GROUP BY lower(b.username)
      ORDER BY MAX(a.followersCount) IS NULL, MAX(a.followersCount) DESC, lower(b.username)
      LIMIT ${limit}`,
    prisma.$queryRaw`
      SELECT COUNT(DISTINCT lower(b.username)) AS remaining
      ${fromLists}
      WHERE ${notWhitelisted} AND NOT ${isDone}`,
  ]);

  const progressById = Object.fromEntries(progress.map((p) => [p.id, p]));
  res.json({
    lists: subscriptions.map(({ banlist, mode }) => ({
      id: banlist.id,
      name: banlist.name,
      mode,
      total: Number(progressById[banlist.id]?.total ?? 0),
      done: Number(progressById[banlist.id]?.done ?? 0),
    })),
    queue: queue.map((q) => ({
      username: q.username,
      followersCount: q.followersCount === null ? null : Number(q.followersCount),
      lists: q.lists.split(","),
      action: Number(q.block) ? "block" : "mute",
    })),
    remaining: Number(remaining),
  });
});

// --- Errors ---

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  // HttpErrors and body-parser errors (expose: true) are safe to show; anything else stays in the logs
  const isPublic = err instanceof HttpError || err.expose;
  if (!isPublic) console.error(err);
  res.status(isPublic ? err.status : 500).json({ message: isPublic ? err.message : "Internal server error" });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`XBlock server listening on http://${HOST}:${PORT}`);
});

// Let in-flight requests and SQLite writes finish when Coolify stops the container
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}
