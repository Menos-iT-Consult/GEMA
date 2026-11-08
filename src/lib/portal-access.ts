import { eq } from "drizzle-orm";
import { readSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function getActiveOrganizationSession() {
  const session = await readSession();
  if (!session) return { error: "Unauthorized", status: 401 } as const;
  if (
    !session.orgId ||
    (session.role !== "ORG_ADMIN" && session.role !== "MEMBER_VIEWER")
  ) {
    return { error: "This account is not linked to an organisation", status: 403 } as const;
  }

  const [account] = await db
    .select({ isActive: users.isActive })
    .from(users)
    .where(eq(users.id, session.sub))
    .limit(1);
  if (!account || account.isActive === 0) {
    return { error: "This account has been deactivated", status: 403 } as const;
  }

  return { session, orgId: session.orgId } as const;
}
