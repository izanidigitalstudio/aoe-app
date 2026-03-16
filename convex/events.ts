import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listEvents = query({
  args: {
    status: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("events"),
      title: v.string(),
      description: v.string(),
      city: v.string(),
      country: v.string(),
      venue: v.string(),
      date: v.number(),
      imageUrl: v.optional(v.string()),
      capacity: v.number(),
      status: v.string(),
      rsvpCount: v.number(),
      ticketPrice: v.optional(v.number()),
      currency: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
      sponsors: v.optional(v.array(v.object({
        name: v.string(),
        tier: v.string(),
        logo: v.optional(v.string()),
        website: v.optional(v.string()),
      }))),
      guestSpeakers: v.optional(v.array(v.object({
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        designation: v.optional(v.string()),
        company: v.optional(v.string()),
        status: v.string(),
        notes: v.optional(v.string()),
      }))),
      invitedGuests: v.optional(v.array(v.object({
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        designation: v.optional(v.string()),
        company: v.optional(v.string()),
        status: v.string(),
        notes: v.optional(v.string()),
      }))),
    })
  ),
  handler: async (ctx, args) => {
    let q = ctx.db.query("events");
    if (args.status) {
      q = q.withIndex("by_status", (qb) => qb.eq("status", args.status));
    }
    const events = await q.collect();
    // Sort by sortOrder if present, otherwise by date
    const sorted = events.sort((a, b) => {
      const aOrder = a.sortOrder ?? a.date;
      const bOrder = b.sortOrder ?? b.date;
      return aOrder - bOrder;
    });
    return sorted.map((event) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      city: event.city,
      country: event.country,
      venue: event.venue,
      date: event.date,
      imageUrl: event.imageUrl,
      capacity: event.capacity,
      status: event.status,
      rsvpCount: event.rsvpCount || 0,
      ticketPrice: event.ticketPrice,
      currency: event.currency,
      sortOrder: event.sortOrder,
      sponsors: event.sponsors,
      guestSpeakers: event.guestSpeakers,
      invitedGuests: event.invitedGuests,
    }));
  },
});

export const rsvpEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();

    if (existing) {
      if (existing.status === "attending") {
        await ctx.db.patch(existing._id, { status: "cancelled" });
      } else {
        await ctx.db.patch(existing._id, { status: "attending" });
      }
    } else {
      const event = await ctx.db.get(args.eventId);
      if (!event) throw new Error("Event not found");
      const rsvps = await ctx.db
        .query("eventRsvps")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();
      const attendingCount = rsvps.filter((r) => r.status === "attending").length;
      const status = attendingCount >= event.capacity ? "waitlist" : "attending";
      await ctx.db.insert("eventRsvps", {
        eventId: args.eventId,
        userId: user._id,
        status,
      });
    }
    return null;
  },
});