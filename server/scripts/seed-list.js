// Creates a block list owned by a throwaway user, for testing subscriptions and batch blocking.
// Usage: npm --prefix server run seed:list -- handle1 handle2 ...
require("dotenv").config({ quiet: true });

const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { randomAnimal } = require("../src/randomName");

const prisma = new PrismaClient();

(async () => {
  const handles = process.argv.slice(2).map((h) => h.replace(/^@/, "")).filter(Boolean);
  if (handles.length === 0) {
    console.error("Usage: npm --prefix server run seed:list -- handle1 handle2 ...");
    process.exit(1);
  }

  const owner = await prisma.user.create({ data: { id: `seed-${crypto.randomUUID()}` } });
  let id;
  do {
    id = crypto.randomInt(0x100000).toString(16).toUpperCase().padStart(5, "0");
  } while (await prisma.banlist.findUnique({ where: { id } }));

  const banlist = await prisma.banlist.create({
    data: {
      id,
      ownerId: owner.id,
      name: `${randomAnimal()} Test List`,
      bannedUsers: { create: [...new Set(handles)].map((username) => ({ username })) },
    },
  });

  console.log(`Created "${banlist.name}" with ${handles.length} account(s). Share code: XBK-${banlist.id}`);
  await prisma.$disconnect();
})();
