import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

/**
 * Complete registration: sets member type, profile fields, and sends welcome email.
 * Called after the user signs up via password auth.
 */
export const completeRegistration = mutation({
  args: {
    memberType: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    industry: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const updateFields: Record<string, unknown> = {
      memberType: args.memberType,
      onboarded: true,
    };

    if (args.name) updateFields.name = args.name;
    if (args.company) updateFields.company = args.company;
    if (args.role) updateFields.role = args.role;
    if (args.industry) updateFields.industry = args.industry;
    if (args.country) updateFields.country = args.country;
    if (args.city) updateFields.city = args.city;
    if (args.contactPhone) updateFields.contactPhone = args.contactPhone;
    if (args.bio) updateFields.bio = args.bio;

    await ctx.db.patch(userId, updateFields);

    // Schedule welcome email
    const memberName = args.name || user.name || "Member";
    const memberEmail = user.email;

    if (memberEmail) {
      await ctx.scheduler.runAfter(0, api.emails.sendRegistrationWelcomeEmail, {
        memberName,
        memberEmail,
        memberType: args.memberType,
      });
    }

    return {
      success: true,
      userName: memberName,
      userEmail: memberEmail,
    };
  },
});