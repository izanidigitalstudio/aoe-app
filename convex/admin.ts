import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// PIN gate is on frontend — admin functions are open for guest/demo access (App Store review)

const adminMemberReturn = v.object({
  _id: v.id("users"),
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  image: v.optional(v.string()),
  company: v.optional(v.string()),
  role: v.optional(v.string()),
  industry: v.optional(v.string()),
  country: v.optional(v.string()),
  city: v.optional(v.string()),
  bio: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  linkedIn: v.optional(v.string()),
  twitter: v.optional(v.string()),
  website: v.optional(v.string()),
  achievements: v.optional(v.string()),
  currentProjects: v.optional(v.string()),
  futureProjects: v.optional(v.string()),
  skills: v.optional(v.array(v.string())),
  memberType: v.optional(v.string()),
  onboarded: v.optional(v.boolean()),
  isAdmin: v.optional(v.boolean()),
  isDemo: v.optional(v.boolean()),
  _creationTime: v.number(),
});

// ─── MEMBER MANAGEMENT ───

export const listAllMembers = query({
  args: { search: v.optional(v.string()), memberType: v.optional(v.string()), industry: v.optional(v.string()) },
  returns: v.array(adminMemberReturn),
  handler: async (ctx, args) => {
    let members;
    if (args.memberType) {
      members = await ctx.db.query("users").withIndex("by_member_type", (q: any) => q.eq("memberType", args.memberType)).order("desc").take(500);
    } else {
      members = await ctx.db.query("users").order("desc").take(500);
    }
    let filtered = members;
    if (args.industry) {
      const ind = args.industry;
      filtered = filtered.filter((m: any) => m.industry === ind);
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      filtered = members.filter(
        (m: any) =>
          (m.name && m.name.toLowerCase().includes(s)) ||
          (m.email && m.email.toLowerCase().includes(s)) ||
          (m.company && m.company.toLowerCase().includes(s)) ||
          (m.country && m.country.toLowerCase().includes(s)) ||
          (m.industry && m.industry.toLowerCase().includes(s))
      );
    }
    return filtered.map((m: any) => ({
      _id: m._id,
      name: m.name,
      email: m.email,
      image: m.image,
      company: m.company,
      role: m.role,
      industry: m.industry,
      country: m.country,
      city: m.city,
      bio: m.bio,
      contactPhone: m.contactPhone,
      contactEmail: m.contactEmail,
      linkedIn: m.linkedIn,
      twitter: m.twitter,
      website: m.website,
      achievements: m.achievements,
      currentProjects: m.currentProjects,
      futureProjects: m.futureProjects,
      skills: m.skills,
      memberType: m.memberType,
      onboarded: m.onboarded,
      isAdmin: m.isAdmin,
      isDemo: m.isDemo,
      _creationTime: m._creationTime,
    }));
  },
});

export const getMemberIndustryCounts = query({
  args: { memberType: v.string() },
  returns: v.array(v.object({ industry: v.string(), count: v.number() })),
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("users")
      .withIndex("by_member_type", (q: any) => q.eq("memberType", args.memberType))
      .collect();
    const counts: Record<string, number> = {};
    for (const m of members) {
      const ind = (m as any).industry || "Other";
      counts[ind] = (counts[ind] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);
  },
});

export const addMember = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    industry: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    bio: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    linkedIn: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),
    achievements: v.optional(v.string()),
    currentProjects: v.optional(v.string()),
    futureProjects: v.optional(v.string()),
    memberType: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      ...args,
      onboarded: true,
      isDemo: false,
    });
    return id;
  },
});

export const bulkAddMembers = mutation({
  args: {
    members: v.array(
      v.object({
        name: v.string(),
        email: v.string(),
        company: v.optional(v.string()),
        role: v.optional(v.string()),
        industry: v.optional(v.string()),
        country: v.optional(v.string()),
        city: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        contactEmail: v.optional(v.string()),
        website: v.optional(v.string()),
        bio: v.optional(v.string()),
        linkedIn: v.optional(v.string()),
        twitter: v.optional(v.string()),
        achievements: v.optional(v.string()),
        currentProjects: v.optional(v.string()),
        futureProjects: v.optional(v.string()),
        memberType: v.optional(v.string()),
      })
    ),
  },
  returns: v.object({ added: v.number(), skipped: v.number() }),
  handler: async (ctx, args) => {
    let added = 0;
    let skipped = 0;
    for (const member of args.members) {
      const existing = await ctx.db
        .query("users")
        .withIndex("email", (q: any) => q.eq("email", member.email))
        .unique();
      if (existing) {
        skipped++;
        continue;
      }
      await ctx.db.insert("users", {
        ...member,
        onboarded: true,
        isDemo: false,
      });
      added++;
    }
    return { added, skipped };
  },
});

export const bulkUpdateMembers = mutation({
  args: {
    updates: v.array(
      v.object({
        email: v.string(),
        role: v.optional(v.string()),
        image: v.optional(v.string()),
        bio: v.optional(v.string()),
      })
    ),
  },
  returns: v.object({ updated: v.number(), notFound: v.number() }),
  handler: async (ctx, args) => {
    let updated = 0;
    let notFound = 0;
    for (const item of args.updates) {
      const member = await ctx.db
        .query("users")
        .withIndex("email", (q: any) => q.eq("email", item.email))
        .unique();
      if (!member) {
        notFound++;
        continue;
      }
      const patch: Record<string, any> = {};
      if (item.role !== undefined) patch.role = item.role;
      if (item.image !== undefined) patch.image = item.image;
      if (item.bio !== undefined) patch.bio = item.bio;
      await ctx.db.patch(member._id, patch);
      updated++;
    }
    return { updated, notFound };
  },
});

export const updateMember = mutation({
  args: {
    memberId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    industry: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    bio: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    linkedIn: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),
    achievements: v.optional(v.string()),
    currentProjects: v.optional(v.string()),
    futureProjects: v.optional(v.string()),
    memberType: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { memberId, ...updates } = args;
    const clean: Record<string, any> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) clean[k] = val;
    }
    await ctx.db.patch(memberId, clean);
    return null;
  },
});

export const deleteMember = mutation({
  args: { memberId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.memberId);
    return null;
  },
});

// ─── EVENT MANAGEMENT ───

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    city: v.string(),
    country: v.string(),
    venue: v.string(),
    date: v.number(),
    capacity: v.number(),
    ticketPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    sponsors: v.optional(v.array(v.object({
      name: v.string(),
      tier: v.string(),
      logo: v.optional(v.string()),
      website: v.optional(v.string()),
    }))),
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("events", {
      ...args,
      status: "upcoming",
      rsvpCount: 0,
    });
    return id;
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    venue: v.optional(v.string()),
    date: v.optional(v.number()),
    capacity: v.optional(v.number()),
    status: v.optional(v.string()),
    ticketPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    sponsors: v.optional(v.array(v.object({
      name: v.string(),
      tier: v.string(),
      logo: v.optional(v.string()),
      website: v.optional(v.string()),
    }))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;
    const clean: Record<string, any> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) clean[k] = val;
    }
    await ctx.db.patch(eventId, clean);
    return null;
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const rsvps = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event", (q: any) => q.eq("eventId", args.eventId))
      .collect();
    for (const rsvp of rsvps) {
      await ctx.db.delete(rsvp._id);
    }
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_event", (q: any) => q.eq("eventId", args.eventId))
      .collect();
    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }
    await ctx.db.delete(args.eventId);
    return null;
  },
});

export const getEventRsvps = query({
  args: { eventId: v.id("events") },
  returns: v.array(
    v.object({
      _id: v.id("eventRsvps"),
      userId: v.id("users"),
      userName: v.optional(v.string()),
      userEmail: v.optional(v.string()),
      userCompany: v.optional(v.string()),
      userPhone: v.optional(v.string()),
      userCountry: v.optional(v.string()),
      status: v.string(),
      paymentStatus: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const rsvps = await ctx.db
      .query("eventRsvps")
      .withIndex("by_event", (q: any) => q.eq("eventId", args.eventId))
      .collect();
    const result = [];
    for (const rsvp of rsvps) {
      const user = await ctx.db.get(rsvp.userId);
      const payments = await ctx.db
        .query("payments")
        .withIndex("by_event", (q: any) => q.eq("eventId", args.eventId))
        .collect();
      const userPayment = payments.find((p: any) => p.userId && p.userId === rsvp.userId);
      result.push({
        _id: rsvp._id,
        userId: rsvp.userId,
        userName: user?.name,
        userEmail: user?.email || user?.contactEmail,
        userCompany: user?.company,
        userPhone: user?.contactPhone,
        userCountry: user?.country,
        status: rsvp.status,
        paymentStatus: userPayment?.status,
      });
    }
    return result;
  },
});

export const updateRsvpStatus = mutation({
  args: {
    rsvpId: v.id("eventRsvps"),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.rsvpId, { status: args.status });
    return null;
  },
});

// ─── PAYMENT MANAGEMENT ───

export const recordPayment = mutation({
  args: {
    eventId: v.optional(v.id("events")),
    userId: v.optional(v.id("users")),
    amount: v.number(),
    currency: v.string(),
    method: v.string(),
    status: v.string(),
    reference: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("payments"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const id = await ctx.db.insert("payments", {
      ...args,
      confirmedBy: args.status === "confirmed" ? (identity?.email ?? "admin") : undefined,
      confirmedAt: args.status === "confirmed" ? Date.now() : undefined,
    });
    return id;
  },
});

export const updatePayment = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.optional(v.string()),
    reference: v.optional(v.string()),
    notes: v.optional(v.string()),
    method: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const { paymentId, ...updates } = args;
    const clean: Record<string, any> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) clean[k] = val;
    }
    if (updates.status === "confirmed") {
      clean.confirmedBy = identity?.email ?? "admin";
      clean.confirmedAt = Date.now();
    }
    await ctx.db.patch(paymentId, clean);
    return null;
  },
});

export const deletePayment = mutation({
  args: { paymentId: v.id("payments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.paymentId);
    return null;
  },
});

export const listPayments = query({
  args: { eventId: v.optional(v.id("events")), status: v.optional(v.string()) },
  returns: v.array(
    v.object({
      _id: v.id("payments"),
      eventId: v.optional(v.id("events")),
      userId: v.optional(v.id("users")),
      userName: v.optional(v.string()),
      userEmail: v.optional(v.string()),
      eventTitle: v.optional(v.string()),
      amount: v.number(),
      currency: v.string(),
      method: v.string(),
      status: v.string(),
      reference: v.optional(v.string()),
      notes: v.optional(v.string()),
      confirmedBy: v.optional(v.string()),
      confirmedAt: v.optional(v.number()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let paymentsQuery;
    if (args.eventId) {
      paymentsQuery = await ctx.db
        .query("payments")
        .withIndex("by_event", (q: any) => q.eq("eventId", args.eventId))
        .order("desc")
        .collect();
    } else if (args.status) {
      paymentsQuery = await ctx.db
        .query("payments")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .order("desc")
        .collect();
    } else {
      paymentsQuery = await ctx.db.query("payments").order("desc").take(200);
    }
    const result = [];
    for (const p of paymentsQuery) {
      const user = p.userId ? await ctx.db.get(p.userId) : null;
      const event = p.eventId ? await ctx.db.get(p.eventId) : null;
      result.push({
        _id: p._id,
        eventId: p.eventId,
        userId: p.userId,
        userName: user?.name,
        userEmail: user?.email || user?.contactEmail,
        eventTitle: event?.title,
        amount: p.amount,
        currency: p.currency,
        method: p.method,
        status: p.status,
        reference: p.reference,
        notes: p.notes,
        confirmedBy: p.confirmedBy,
        confirmedAt: p.confirmedAt,
        _creationTime: p._creationTime,
      });
    }
    return result;
  },
});

// ─── CRM NOTES ───

export const addNote = mutation({
  args: {
    memberId: v.id("users"),
    note: v.string(),
    type: v.string(),
  },
  returns: v.id("adminNotes"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const id = await ctx.db.insert("adminNotes", {
      memberId: args.memberId,
      note: args.note,
      type: args.type,
      createdBy: identity?.email ?? "admin",
    });
    return id;
  },
});

export const getMemberNotes = query({
  args: { memberId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("adminNotes"),
      note: v.string(),
      type: v.string(),
      createdBy: v.optional(v.string()),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("adminNotes")
      .withIndex("by_member", (q: any) => q.eq("memberId", args.memberId))
      .order("desc")
      .collect();
    return notes.map((n: any) => ({
      _id: n._id,
      note: n.note,
      type: n.type,
      createdBy: n.createdBy,
      _creationTime: n._creationTime,
    }));
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("adminNotes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
    return null;
  },
});

// ─── GUEST SPEAKERS ───

export const addGuestSpeaker = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    designation: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const speakers = event.guestSpeakers || [];
    speakers.push({
      name: args.name,
      email: args.email,
      phone: args.phone,
      designation: args.designation,
      company: args.company,
      status: args.status,
      notes: args.notes,
    });
    await ctx.db.patch(args.eventId, { guestSpeakers: speakers });
    return null;
  },
});

export const updateGuestSpeaker = mutation({
  args: {
    eventId: v.id("events"),
    index: v.number(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    designation: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const speakers = [...(event.guestSpeakers || [])];
    if (args.index < 0 || args.index >= speakers.length) throw new Error("Invalid index");
    const speaker = { ...speakers[args.index] };
    if (args.name !== undefined) speaker.name = args.name;
    if (args.email !== undefined) speaker.email = args.email;
    if (args.phone !== undefined) speaker.phone = args.phone;
    if (args.designation !== undefined) speaker.designation = args.designation;
    if (args.company !== undefined) speaker.company = args.company;
    if (args.status !== undefined) speaker.status = args.status;
    if (args.notes !== undefined) speaker.notes = args.notes;
    speakers[args.index] = speaker;
    await ctx.db.patch(args.eventId, { guestSpeakers: speakers });
    return null;
  },
});

export const removeGuestSpeaker = mutation({
  args: {
    eventId: v.id("events"),
    index: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const speakers = [...(event.guestSpeakers || [])];
    if (args.index < 0 || args.index >= speakers.length) throw new Error("Invalid index");
    speakers.splice(args.index, 1);
    await ctx.db.patch(args.eventId, { guestSpeakers: speakers });
    return null;
  },
});

// ─── INVITED GUESTS ───

export const addInvitedGuest = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    designation: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const guests = event.invitedGuests || [];
    guests.push({
      name: args.name,
      email: args.email,
      phone: args.phone,
      designation: args.designation,
      company: args.company,
      status: args.status,
      notes: args.notes,
    });
    await ctx.db.patch(args.eventId, { invitedGuests: guests });
    return null;
  },
});

export const updateInvitedGuest = mutation({
  args: {
    eventId: v.id("events"),
    index: v.number(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    designation: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const guests = [...(event.invitedGuests || [])];
    if (args.index < 0 || args.index >= guests.length) throw new Error("Invalid index");
    const guest = { ...guests[args.index] };
    if (args.name !== undefined) guest.name = args.name;
    if (args.email !== undefined) guest.email = args.email;
    if (args.phone !== undefined) guest.phone = args.phone;
    if (args.designation !== undefined) guest.designation = args.designation;
    if (args.company !== undefined) guest.company = args.company;
    if (args.status !== undefined) guest.status = args.status;
    if (args.notes !== undefined) guest.notes = args.notes;
    guests[args.index] = guest;
    await ctx.db.patch(args.eventId, { invitedGuests: guests });
    return null;
  },
});

export const removeInvitedGuest = mutation({
  args: {
    eventId: v.id("events"),
    index: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const guests = [...(event.invitedGuests || [])];
    if (args.index < 0 || args.index >= guests.length) throw new Error("Invalid index");
    guests.splice(args.index, 1);
    await ctx.db.patch(args.eventId, { invitedGuests: guests });
    return null;
  },
});

// ─── EVENT ORDERING ───

export const reorderEvent = mutation({
  args: {
    eventId: v.id("events"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const events = await ctx.db.query("events").collect();
    // Sort by sortOrder first, then by date
    const sorted = events.sort((a: any, b: any) => {
      const aOrder = a.sortOrder ?? a.date;
      const bOrder = b.sortOrder ?? b.date;
      return aOrder - bOrder;
    });
    const idx = sorted.findIndex((e: any) => e._id === args.eventId);
    if (idx === -1) return null;
    const swapIdx = args.direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return null;
    // Swap sort orders
    const currentOrder = sorted[idx].sortOrder ?? sorted[idx].date;
    const swapOrder = sorted[swapIdx].sortOrder ?? sorted[swapIdx].date;
    await ctx.db.patch(sorted[idx]._id, { sortOrder: swapOrder });
    await ctx.db.patch(sorted[swapIdx]._id, { sortOrder: currentOrder });
    return null;
  },
});

export const sortEventsByDate = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    const sorted = events.sort((a: any, b: any) => a.date - b.date);
    for (let i = 0; i < sorted.length; i++) {
      await ctx.db.patch(sorted[i]._id, { sortOrder: i + 1 });
    }
    return null;
  },
});

// ─── MIGRATE EXISTING MEMBERS ───

export const migrateExistingMembers = mutation({
  args: { memberType: v.string() },
  returns: v.object({ updated: v.number() }),
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    let updated = 0;
    for (const user of users) {
      if (!user.memberType && user.onboarded) {
        await ctx.db.patch(user._id, { memberType: args.memberType });
        updated++;
      }
    }
    return { updated };
  },
});

export const bulkReassignMemberType = mutation({
  args: { fromType: v.string(), toType: v.string() },
  returns: v.object({ updated: v.number() }),
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("users")
      .withIndex("by_member_type", (q: any) => q.eq("memberType", args.fromType))
      .collect();
    let updated = 0;
    for (const member of members) {
      await ctx.db.patch(member._id, { memberType: args.toType });
      updated++;
    }
    return { updated };
  },
});

// ─── ENHANCED STATS & REPORTING ───

export const getStats = query({
  args: {},
  returns: v.object({
    totalMembers: v.number(),
    totalEvents: v.number(),
    totalRsvps: v.number(),
    totalProjects: v.number(),
    totalRevenue: v.number(),
    pendingPayments: v.number(),
    confirmedPayments: v.number(),
    revenueByMethod: v.array(v.object({ method: v.string(), total: v.number(), count: v.number() })),
  }),
  handler: async (ctx) => {
    const members = await ctx.db.query("users").collect();
    const events = await ctx.db.query("events").collect();
    const rsvps = await ctx.db.query("eventRsvps").collect();
    const projects = await ctx.db.query("projects").collect();
    const payments = await ctx.db.query("payments").collect();

    const confirmed = payments.filter((p: any) => p.status === "confirmed");
    const pending = payments.filter((p: any) => p.status === "pending");
    const totalRevenue = confirmed.reduce((sum: number, p: any) => sum + p.amount, 0);

    const methodMap: Record<string, { total: number; count: number }> = {};
    for (const p of confirmed) {
      if (!methodMap[p.method]) methodMap[p.method] = { total: 0, count: 0 };
      methodMap[p.method].total += p.amount;
      methodMap[p.method].count++;
    }
    const revenueByMethod = Object.entries(methodMap).map(([method, data]) => ({
      method,
      total: data.total,
      count: data.count,
    }));

    return {
      totalMembers: members.filter((m: any) => m.onboarded).length,
      totalEvents: events.length,
      totalRsvps: rsvps.filter((r: any) => r.status === "attending").length,
      totalProjects: projects.length,
      totalRevenue,
      pendingPayments: pending.length,
      confirmedPayments: confirmed.length,
      revenueByMethod,
    };
  },
});

export const getReportData = query({
  args: {},
  returns: v.object({
    membersByCountry: v.array(v.object({ country: v.string(), count: v.number() })),
    membersByIndustry: v.array(v.object({ industry: v.string(), count: v.number() })),
    eventPerformance: v.array(
      v.object({
        _id: v.id("events"),
        title: v.string(),
        city: v.string(),
        country: v.string(),
        capacity: v.number(),
        rsvpCount: v.number(),
        attendingCount: v.number(),
        revenue: v.number(),
        fillRate: v.number(),
      })
    ),
    recentMembers: v.array(v.object({ name: v.optional(v.string()), email: v.optional(v.string()), joinedAt: v.number() })),
    monthlyGrowth: v.array(v.object({ month: v.string(), members: v.number(), revenue: v.number() })),
    rsvpConversion: v.object({ total: v.number(), attending: v.number(), cancelled: v.number(), waitlist: v.number() }),
  }),
  handler: async (ctx) => {
    const members = await ctx.db.query("users").collect();
    const onboarded = members.filter((m: any) => m.onboarded);
    const events = await ctx.db.query("events").collect();
    const rsvps = await ctx.db.query("eventRsvps").collect();
    const payments = await ctx.db.query("payments").collect();

    // Members by country
    const countryMap: Record<string, number> = {};
    for (const m of onboarded) {
      const c = m.country || "Unknown";
      countryMap[c] = (countryMap[c] || 0) + 1;
    }
    const membersByCountry = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    // Members by industry
    const industryMap: Record<string, number> = {};
    for (const m of onboarded) {
      const i = m.industry || "Unknown";
      industryMap[i] = (industryMap[i] || 0) + 1;
    }
    const membersByIndustry = Object.entries(industryMap)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);

    // Event performance
    const eventPerformance = [];
    for (const event of events) {
      const eventRsvps = rsvps.filter((r: any) => r.eventId === event._id);
      const attending = eventRsvps.filter((r: any) => r.status === "attending").length;
      const eventPayments = payments.filter((p: any) => p.eventId === event._id && p.status === "confirmed");
      const revenue = eventPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      eventPerformance.push({
        _id: event._id,
        title: event.title,
        city: event.city,
        country: event.country,
        capacity: event.capacity,
        rsvpCount: eventRsvps.length,
        attendingCount: attending,
        revenue,
        fillRate: event.capacity > 0 ? Math.round((attending / event.capacity) * 100) : 0,
      });
    }

    // Recent members (last 10)
    const sortedMembers = [...onboarded].sort((a, b) => b._creationTime - a._creationTime);
    const recentMembers = sortedMembers.slice(0, 10).map((m) => ({
      name: m.name,
      email: m.email,
      joinedAt: m._creationTime,
    }));

    // Monthly growth (last 6 months)
    const now = Date.now();
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now);
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      const ms = monthStart.getTime();
      const me = monthEnd.getTime();
      const monthMembers = onboarded.filter((m: any) => m._creationTime >= ms && m._creationTime < me).length;
      const monthRevenue = payments
        .filter((p: any) => p.status === "confirmed" && p._creationTime >= ms && p._creationTime < me)
        .reduce((sum: number, p: any) => sum + p.amount, 0);
      const label = monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthlyGrowth.push({ month: label, members: monthMembers, revenue: monthRevenue });
    }

    // RSVP conversion
    const rsvpConversion = {
      total: rsvps.length,
      attending: rsvps.filter((r: any) => r.status === "attending").length,
      cancelled: rsvps.filter((r: any) => r.status === "cancelled").length,
      waitlist: rsvps.filter((r: any) => r.status === "waitlist").length,
    };

    return {
      membersByCountry,
      membersByIndustry,
      eventPerformance,
      recentMembers,
      monthlyGrowth,
      rsvpConversion,
    };
  },
});