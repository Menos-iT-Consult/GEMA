import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { registerOrgSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerOrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const d = parsed.data;

    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, d.slug))
      .limit(1);
    if (existing.length) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }

    const [row] = await db
      .insert(organizations)
      .values({
        name: d.name,
        slug: d.slug,
        denomination: d.denomination,
        umbrellaBody: d.umbrellaBody as never,
        registrationNumber: d.registrationNumber ?? null,
        email: d.email,
        phonePrimary: d.phonePrimary,
        phoneSecondary: d.phoneSecondary ?? null,
        website: d.website || null,
        region: d.region as never,
        cityTown: d.cityTown,
        digitalAddress: d.digitalAddress ?? null,
        physicalAddress: d.physicalAddress,
        logoR2Key: d.logoR2Key ?? null,
        bannerR2Key: d.bannerR2Key ?? null,
        legalDocR2Key: d.legalDocR2Key ?? null,
        status: "PENDING_REVIEW",
        statementOfFaithSignedAt: new Date(),
        signedByLeaderName: d.signedByLeaderName,
        signedByLeaderTitle: d.signedByLeaderTitle,
        ministryFocus: d.ministryFocus ?? [],
        socialLinks: d.socialLinks ?? {},
        missionStatement: d.missionStatement ?? null,
        leaderName: d.leaderName ?? d.signedByLeaderName
      })
      .returning();

    return NextResponse.json({ organization: row }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to register organization" }, { status: 500 });
  }
}
