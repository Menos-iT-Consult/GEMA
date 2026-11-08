import { z } from "zod";
import { GHANA_REGIONS, DENOMINATIONS, UMBRELLA_BODIES, MINISTRY_FOCUS_OPTIONS, ORG_STATUSES } from "@/lib/constants";

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
  logoR2Key: z.string().min(1, "Logo is required").max(500),
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

/**
 * Admin-side organisation creation.
 *
 * Looser than `registerOrgSchema` because an administrator is trusted:
 *  - the slug is optional (auto-derived from the name when omitted)
 *  - no logo upload and no statement-of-faith affirmation is required
 *  - the workflow status can be set directly
 */
export const createOrgSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens")
    .optional(),
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
  status: z.enum(ORG_STATUSES as unknown as [string, ...string[]]).default("APPROVED"),
  // Optional portal login for the new organisation.
  adminUser: z
    .object({
      fullName: z.string().min(2).max(150),
      email: z.string().email(),
      password: z.string().min(8).max(100)
    })
    .optional()
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["PENDING_REVIEW", "UNDER_VETTING", "APPROVED", "SUSPENDED", "RENEWAL_DUE"]),
  note: z.string().max(500).optional()
});

export const updateUserSchema = z
  .object({
    userId: z.string().uuid(),
    isActive: z.union([z.literal(0), z.literal(1)]).optional(),
    role: z.enum(["SUPER_ADMIN", "REGIONAL_OVERSEER", "ORG_ADMIN", "MEMBER_VIEWER"]).optional()
  })
  .refine((v) => v.isActive !== undefined || v.role !== undefined, {
    message: "Provide isActive or role"
  });

/**
 * Organisation-side profile edits from the portal.
 *
 * Identity fields (name, slug, region, denomination, umbrella body,
 * registration number, status) are deliberately not editable here — they are
 * controlled by the Secretariat through the admin dashboard.
 */
export const portalProfileSchema = z.object({
  email: z.string().email(),
  phonePrimary: z.string().min(7).max(20),
  phoneSecondary: z.string().max(20).optional().nullable(),
  website: z.string().url().optional().or(z.literal("")).nullable(),
  digitalAddress: z
    .string()
    .max(20)
    .regex(/^([A-Z]{2,3}-\d{3,4}-\d{4})?$/, "Use GhanaPost GPS format e.g. GA-123-4567")
    .optional()
    .nullable(),
  physicalAddress: z.string().min(3).max(500),
  missionStatement: z.string().max(2000).optional().nullable(),
  leaderName: z.string().max(150).optional().nullable(),
  ministryFocus: z.array(z.enum(MINISTRY_FOCUS_OPTIONS as unknown as [string, ...string[]])).default([]),
  logoR2Key: z.string().max(500).optional().nullable(),
  bannerR2Key: z.string().max(500).optional().nullable(),
  socialLinks: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional()
    })
    .default({})
});

export type PortalProfileInput = z.infer<typeof portalProfileSchema>;

/**
 * Portal-side member management.
 *
 * Organisation admins can invite their own staff to the portal and manage
 * them, but they can never mint Secretariat-level accounts — hence the
 * restricted role set.
 */
export const PORTAL_MEMBER_ROLES = ["ORG_ADMIN", "MEMBER_VIEWER"] as const;

export const portalMemberCreateSchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(PORTAL_MEMBER_ROLES).default("MEMBER_VIEWER")
});

export const portalMemberUpdateSchema = z
  .object({
    userId: z.string().uuid(),
    isActive: z.union([z.literal(0), z.literal(1)]).optional(),
    role: z.enum(PORTAL_MEMBER_ROLES).optional()
  })
  .refine((v) => v.isActive !== undefined || v.role !== undefined, {
    message: "Provide isActive or role"
  });

export type PortalMemberCreateInput = z.infer<typeof portalMemberCreateSchema>;
export type PortalMemberUpdateInput = z.infer<typeof portalMemberUpdateSchema>;
