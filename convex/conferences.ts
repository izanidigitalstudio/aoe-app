import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    focus: v.optional(v.string()),
    country: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("conferences"),
    _creationTime: v.number(),
    name: v.string(),
    focus: v.string(),
    date: v.string(),
    location: v.string(),
    country: v.string(),
    description: v.string(),
    website: v.string(),
    attendees: v.string(),
    icon: v.string(),
    contactEmail: v.optional(v.string()),
    speakerEmail: v.optional(v.string()),
    delegateInfo: v.optional(v.object({
      delegateFee: v.optional(v.string()),
      earlyBirdDeadline: v.optional(v.string()),
      includes: v.optional(v.array(v.string())),
      delegateTypes: v.optional(v.array(v.string())),
    })),
  })),
  handler: async (ctx, args) => {
    let conferences;

    // Can only use one index per query in Convex
    if (args.focus && args.focus !== "All") {
      conferences = await ctx.db.query("conferences")
        .withIndex("by_focus", (q) => q.eq("focus", args.focus!))
        .collect();
    } else if (args.country && args.country !== "All") {
      conferences = await ctx.db.query("conferences")
        .withIndex("by_country", (q) => q.eq("country", args.country!))
        .collect();
    } else {
      conferences = await ctx.db.query("conferences").collect();
    }

    // Apply second filter manually if both provided
    if (args.focus && args.focus !== "All" && args.country && args.country !== "All") {
      conferences = conferences.filter((c) => c.country === args.country);
    }

    return conferences.slice(0, args.limit || 1000);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    focus: v.string(),
    date: v.string(),
    location: v.string(),
    country: v.string(),
    description: v.string(),
    website: v.string(),
    attendees: v.string(),
    icon: v.string(),
    contactEmail: v.optional(v.string()),
    speakerEmail: v.optional(v.string()),
    delegateInfo: v.optional(v.object({
      delegateFee: v.optional(v.string()),
      earlyBirdDeadline: v.optional(v.string()),
      includes: v.optional(v.array(v.string())),
      delegateTypes: v.optional(v.array(v.string())),
    })),
  },
  returns: v.id("conferences"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);

    if (!user?.isAdmin) throw new Error("Not authorized");

    return await ctx.db.insert("conferences", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("conferences"),
    name: v.optional(v.string()),
    focus: v.optional(v.string()),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
    country: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    attendees: v.optional(v.string()),
    icon: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    speakerEmail: v.optional(v.string()),
    delegateInfo: v.optional(v.object({
      delegateFee: v.optional(v.string()),
      earlyBirdDeadline: v.optional(v.string()),
      includes: v.optional(v.array(v.string())),
      delegateTypes: v.optional(v.array(v.string())),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);

    if (!user?.isAdmin) throw new Error("Not authorized");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("conferences") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);

    if (!user?.isAdmin) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
  },
});

// Temporary bulk insert for seeding - remove auth check for initial seed
export const bulkInsert = mutation({
  args: {
    conferences: v.array(v.object({
      name: v.string(),
      focus: v.string(),
      date: v.string(),
      location: v.string(),
      country: v.string(),
      description: v.string(),
      website: v.string(),
      attendees: v.string(),
      icon: v.string(),
      contactEmail: v.optional(v.string()),
      speakerEmail: v.optional(v.string()),
      delegateInfo: v.optional(v.object({
        delegateFee: v.optional(v.string()),
        earlyBirdDeadline: v.optional(v.string()),
        includes: v.optional(v.array(v.string())),
        delegateTypes: v.optional(v.array(v.string())),
      })),
    })),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let count = 0;
    for (const conf of args.conferences) {
      await ctx.db.insert("conferences", conf);
      count++;
    }
    return count;
  },
});
