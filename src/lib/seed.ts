import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";

export async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@ghanamissions.org";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!";
  const { eq } = await import("drizzle-orm");
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { created: false, email };
  await db.insert(users).values({
    fullName: "Site Administrator",
    email,
    passwordHash: await hashPassword(password),
    role: "SUPER_ADMIN"
  });
  return { created: true, email };
}
