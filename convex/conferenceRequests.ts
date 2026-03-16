import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const delegateTypeValidator = v.union(
  v.literal("full_delegate"),
  v.literal("day_pass"),
  v.literal("virtual"),
  v.literal("speaker"),
  v.literal("exhibitor")
);

const statusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("declined")
);

export const submitRequest = mutation({
  args: {
    conferenceName: v.string(),
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    designation: v.optional(v.string()),
    delegateType: delegateTypeValidator,
    specialRequirements: v.optional(v.string()),
  },
  returns: v.id("conferenceRequests"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for existing request for this conference
    const existing = await ctx.db
      .query("conferenceRequests")
      .withIndex("by_user_and_conference", (q) =>
        q.eq("userId", userId).eq("conferenceName", args.conferenceName)
      )
      .first();

    if (existing) {
      throw new Error("You have already submitted a request for this conference");
    }

    return await ctx.db.insert("conferenceRequests", {
      userId,
      conferenceName: args.conferenceName,
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      company: args.company,
      designation: args.designation,
      delegateType: args.delegateType,
      specialRequirements: args.specialRequirements,
      status: "pending",
    });
  },
});

export const getMyRequest = query({
  args: {
    conferenceName: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("conferenceRequests"),
      _creationTime: v.number(),
      conferenceName: v.string(),
      fullName: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      company: v.optional(v.string()),
      designation: v.optional(v.string()),
      delegateType: delegateTypeValidator,
      specialRequirements: v.optional(v.string()),
      status: statusValidator,
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const request = await ctx.db
      .query("conferenceRequests")
      .withIndex("by_user_and_conference", (q) =>
        q.eq("userId", userId).eq("conferenceName", args.conferenceName)
      )
      .first();

    if (!request) return null;

    return {
      _id: request._id,
      _creationTime: request._creationTime,
      conferenceName: request.conferenceName,
      fullName: request.fullName,
      email: request.email,
      phone: request.phone,
      company: request.company,
      designation: request.designation,
      delegateType: request.delegateType as "full_delegate" | "day_pass" | "virtual" | "speaker" | "exhibitor",
      specialRequirements: request.specialRequirements,
      status: request.status as "pending" | "approved" | "declined",
    };
  },
});

export const getMyRequests = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("conferenceRequests"),
      _creationTime: v.number(),
      conferenceName: v.string(),
      fullName: v.string(),
      delegateType: delegateTypeValidator,
      status: statusValidator,
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("conferenceRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return requests.map((r) => ({
      _id: r._id,
      _creationTime: r._creationTime,
      conferenceName: r.conferenceName,
      fullName: r.fullName,
      delegateType: r.delegateType as "full_delegate" | "day_pass" | "virtual" | "speaker" | "exhibitor",
      status: r.status as "pending" | "approved" | "declined",
    }));
  },
});

export const cancelRequest = mutation({
  args: {
    requestId: v.id("conferenceRequests"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (request.userId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.requestId);
    return null;
  },
});
