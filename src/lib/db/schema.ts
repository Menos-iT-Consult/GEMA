import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  pgEnum,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const ghanaRegionEnum = pgEnum("ghana_region", [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Western North",
  "Central",
  "Eastern",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo"
]);

export const orgStatusEnum = pgEnum("org_status", [
  "PENDING_REVIEW",
  "UNDER_VETTING",
  "APPROVED",
  "SUSPENDED",
  "RENEWAL_DUE"
]);

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "REGIONAL_OVERSEER",
  "ORG_ADMIN",
  "MEMBER_VIEWER"
]);

export const duesStatusEnum = pgEnum("dues_status", ["PAID", "PENDING", "OVERDUE"]);

export const umbrellaBodyEnum = pgEnum("umbrella_body", [
  "GPCC",
  "GEA",
  "NACCC",
  "Independent"
]);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    denomination: text("denomination").notNull(),
    umbrellaBody: umbrellaBodyEnum("umbrella_body").notNull().default("Independent"),
    registrationNumber: text("registration_number"),
    email: text("email").notNull(),
    phonePrimary: text("phone_primary").notNull(),
    phoneSecondary: text("phone_secondary"),
    website: text("website"),
    region: ghanaRegionEnum("region").notNull(),
    cityTown: text("city_town").notNull(),
    digitalAddress: text("digital_address"),
    physicalAddress: text("physical_address").notNull(),
    logoR2Key: text("logo_r2_key"),
    bannerR2Key: text("banner_r2_key"),
    legalDocR2Key: text("legal_doc_r2_key"),
    status: orgStatusEnum("status").notNull().default("PENDING_REVIEW"),
    statementOfFaithSignedAt: timestamp("statement_of_faith_signed_at", {
      withTimezone: true
    }),
    signedByLeaderName: text("signed_by_leader_name"),
    signedByLeaderTitle: text("signed_by_leader_title"),
    ministryFocus: jsonb("ministry_focus").$type<string[]>().default([]),
    socialLinks: jsonb("social_links").$type<{
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
    }>().default({}),
    missionStatement: text("mission_statement"),
    leaderName: text("leader_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    orgSlugIdx: uniqueIndex("org_slug_idx").on(t.slug),
  })
);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("ORG_ADMIN"),
  assignedRegion: ghanaRegionEnum("assigned_region"),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const duesRecords = pgTable("dues_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  year: integer("year").notNull(),
  amountGhs: integer("amount_ghs").notNull(),
  status: duesStatusEnum("status").notNull().default("PENDING"),
  paymentReference: text("payment_reference"),
  receiptR2Key: text("receipt_r2_key"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  dues: many(duesRecords),
  members: many(users)
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id]
  })
}));

export const duesRecordsRelations = relations(duesRecords, ({ one }) => ({
  organization: one(organizations, {
    fields: [duesRecords.orgId],
    references: [organizations.id]
  })
}));

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type AppUser = typeof users.$inferSelect;
export type DuesRecord = typeof duesRecords.$inferSelect;
