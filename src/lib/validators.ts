import { z } from "zod";
import { GHANA_REGIONS, DENOMINATIONS, UMBRELLA_BODIES, MINISTRY_FOCUS_OPTIONS } from "@/lib/constants";

export const registerOrgSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  denomination: z.enum(DENOMINATIONS as unknown as [string, ...string[]]),
  umbrellaBody: z.enum(UMBRELLA_BODIES as unknown as [string, ...string[]]),
  registrationNumber: z.string().max(100).optional().nullable(),
  email: z.string().email(),
  phonePrimary: z.string().min(7).max(20),
  phoneSecondary: z.string().max(20).optional().nullable(),
  website: z.string().url().optional().or(z.literal("")).nullable(),
  region: z.enum(GHANA_REGIONS as unknown as [string, ...string[]]),
  cityTown: z.string().min(1).max(120),
  digitalAddress: z
    .string()
    .max(20)
    .regex(/^([A-Z]{2,3}-\d{3,4}-\d{4})?$/, "Use GhanaPost GPS format e.g. GA-123-4567")
    .optional()
    .nullable(),
  physicalAddress: z.string().min(3).max(500),
  logoR2Key: z.string().max(500).optional().nullable(),
  bannerR2Key: z.string().max(500).optional().nullable(),
  legalDocR2Key: z.string().max(500).optional().nullable(),
  missionStatement: z.string().max(2000).optional().nullable(),
  leaderName: z.string().max(150).optional().nullable(),
  ministryFocus: z.array(z.enum(MINISTRY_FOCUS_OPTIONS as unknown as [string, ...string[]])).default([]),
  socialLinks: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional()
    })
    .default({}),
  statementOfFaithAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must affirm the statement of faith" })
  }),
  signedByLeaderName: z.string().min(2).max(150),
  signedByLeaderTitle: z.string().min(2).max(150)
});

export type RegisterOrgInput = z.infer<typeof registerOrgSchema>;

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["PENDING_REVIEW", "UNDER_VETTING", "APPROVED", "SUSPENDED", "RENEWAL_DUE"]),
  note: z.string().max(500).optional()
});

export const createDuesSchema = z.object({
  orgId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  amountGhs: z.number().int().min(1),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]).default("PENDING"),
  paymentReference: z.string().max(200).optional().nullable()
});
