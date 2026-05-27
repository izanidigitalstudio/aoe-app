import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

const MAY_2026_CUTOFF = new Date(2026, 4, 18).getTime();
const monthMap: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const parseConferenceStartTime = (dateStr: string): number => {
  const value = (dateStr || "").trim();
  if (!value || value.startsWith("TBA")) return Number.MAX_SAFE_INTEGER;

  const normalisedValue = value.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();

  const rangeMatch = normalisedValue.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*(\d{1,2}),\s*(\d{4})$/);
  if (rangeMatch && monthMap[rangeMatch[1].slice(0, 3)] !== undefined) {
    return new Date(parseInt(rangeMatch[4]), monthMap[rangeMatch[1].slice(0, 3)], parseInt(rangeMatch[2])).getTime();
  }

  const crossMonth = normalisedValue.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (crossMonth && monthMap[crossMonth[1].slice(0, 3)] !== undefined) {
    return new Date(parseInt(crossMonth[5]), monthMap[crossMonth[1].slice(0, 3)], parseInt(crossMonth[2])).getTime();
  }

  const monthOnly = normalisedValue.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthOnly && monthMap[monthOnly[1].slice(0, 3)] !== undefined) {
    return new Date(parseInt(monthOnly[2]), monthMap[monthOnly[1].slice(0, 3)], 1).getTime();
  }

  const singleDay = normalisedValue.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (singleDay && monthMap[singleDay[1].slice(0, 3)] !== undefined) {
    return new Date(parseInt(singleDay[3]), monthMap[singleDay[1].slice(0, 3)], parseInt(singleDay[2])).getTime();
  }

  return Number.MAX_SAFE_INTEGER;
};

const sortConferencesAscending = (conferences: any[]) =>
  conferences
    .slice()
    .sort((a, b) => {
      const diff = parseConferenceStartTime(a.date) - parseConferenceStartTime(b.date);
      if (diff !== 0) return diff;
      return (a._creationTime || 0) - (b._creationTime || 0);
    });

const getEditorUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("email", (q: any) => q.eq("email", identity.email))
    .first();

  return user?.isAdmin ? user : null;
};

const conferenceFields = {
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
  speakerContact: v.optional(v.string()),
  delegateInfo: v.optional(v.object({
    delegateFee: v.optional(v.string()),
    earlyBirdDeadline: v.optional(v.string()),
    includes: v.optional(v.array(v.string())),
    delegateTypes: v.optional(v.array(v.string())),
  })),
};

const bulkConferenceFields = {
  name: v.string(),
  date: v.string(),
  country: v.string(),
  focus: v.optional(v.string()),
  location: v.optional(v.string()),
  description: v.optional(v.string()),
  website: v.optional(v.string()),
  attendees: v.optional(v.string()),
  icon: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  speakerEmail: v.optional(v.string()),
  speakerContact: v.optional(v.string()),
  delegateInfo: v.optional(v.object({
    delegateFee: v.optional(v.string()),
    earlyBirdDeadline: v.optional(v.string()),
    includes: v.optional(v.array(v.string())),
    delegateTypes: v.optional(v.array(v.string())),
  })),
  isPublished: v.optional(v.boolean()),
};

const conferenceRecord = v.object({
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
  speakerContact: v.optional(v.string()),
  delegateInfo: v.optional(v.object({
    delegateFee: v.optional(v.string()),
    earlyBirdDeadline: v.optional(v.string()),
    includes: v.optional(v.array(v.string())),
    delegateTypes: v.optional(v.array(v.string())),
  })),
  isPublished: v.optional(v.boolean()),
  isArchived: v.optional(v.boolean()),
  publishedAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  updatedBy: v.optional(v.id("users")),
});

export const list = query({
  args: {
    focus: v.optional(v.string()),
    country: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(conferenceRecord),
  handler: async (ctx, args) => {
    let conferences;

    // Can only use one index per query in Convex
    if (args.focus && args.focus !== "All") {
      conferences = await ctx.db.query("conferences")
        .withIndex("by_focus", (q: any) => q.eq("focus", args.focus!))
        .collect();
    } else if (args.country && args.country !== "All") {
      conferences = await ctx.db.query("conferences")
        .withIndex("by_country", (q: any) => q.eq("country", args.country!))
        .collect();
    } else {
      conferences = await ctx.db.query("conferences").collect();
    }

    // Apply second filter manually if both provided
    if (args.focus && args.focus !== "All" && args.country && args.country !== "All") {
      conferences = conferences.filter((c: any) => c.country === args.country);
    }

    return sortConferencesAscending(conferences).slice(0, args.limit || 1000);
  },
});

export const listAdmin = query({
  args: {},
  returns: v.array(conferenceRecord),
  handler: async (ctx) => {
    const conferences = await ctx.db.query("conferences").collect();
    return sortConferencesAscending(conferences);
  },
});

export const listPublished = query({
  args: {
    focus: v.optional(v.string()),
    country: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(conferenceRecord),
  handler: async (ctx, args) => {
    let conferences;

    if (args.focus && args.focus !== "All") {
      conferences = await ctx.db.query("conferences")
        .withIndex("by_focus", (q: any) => q.eq("focus", args.focus!))
        .collect();
    } else if (args.country && args.country !== "All") {
      conferences = await ctx.db.query("conferences")
        .withIndex("by_country", (q: any) => q.eq("country", args.country!))
        .collect();
    } else {
      conferences = await ctx.db.query("conferences").collect();
    }

    if (args.focus && args.focus !== "All" && args.country && args.country !== "All") {
      conferences = conferences.filter((c: any) => c.country === args.country);
    }

    conferences = conferences.filter((c: { isPublished?: boolean; isArchived?: boolean }) => c.isPublished && !c.isArchived);
    return sortConferencesAscending(conferences).slice(0, args.limit || 1000);
  },
});

export const create = mutation({
  args: conferenceFields,
  returns: v.id("conferences"),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    return await ctx.db.insert("conferences", {
      ...args,
      isPublished: false,
      isArchived: false,
      publishedAt: undefined,
      updatedAt: Date.now(),
      updatedBy: user?._id,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("conferences"),
    ...conferenceFields,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
      updatedBy: user?._id,
    });
  },
});

export const publish = mutation({
  args: { id: v.id("conferences") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    await ctx.db.patch(args.id, {
      isPublished: true,
      isArchived: false,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
      updatedBy: user?._id,
    });
  },
});

export const unpublish = mutation({
  args: { id: v.id("conferences") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    await ctx.db.patch(args.id, {
      isPublished: false,
      updatedAt: Date.now(),
      updatedBy: user?._id,
    });
  },
});

export const archive = mutation({
  args: { id: v.id("conferences") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    await ctx.db.patch(args.id, {
      isArchived: true,
      isPublished: false,
      updatedAt: Date.now(),
      updatedBy: user?._id,
    });
  },
});

export const archivePastConferences = mutation({
  args: {},
  returns: v.object({
    archived: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    const user = await getEditorUser(ctx);
    const now = Date.now();
    const conferences = await ctx.db.query("conferences").collect();
    let archived = 0;
    let skipped = 0;

    for (const conference of conferences) {
      const parsedTime = parseConferenceStartTime(conference.date);
      if (conference.isArchived || parsedTime === Number.MAX_SAFE_INTEGER || parsedTime >= MAY_2026_CUTOFF) {
        skipped++;
        continue;
      }

      await ctx.db.patch(conference._id, {
        isArchived: true,
        isPublished: false,
        updatedAt: now,
        updatedBy: user?._id,
      });
      archived++;
    }

    return { archived, skipped };
  },
});

export const remove = mutation({
  args: { id: v.id("conferences") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Temporary bulk insert for seeding - remove auth check for initial seed
export const bulkInsert = mutation({
  args: {
    conferences: v.array(v.object(conferenceFields)),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    let count = 0;
    for (const conf of args.conferences) {
      await ctx.db.insert("conferences", {
        ...conf,
        isPublished: false,
        isArchived: false,
        publishedAt: undefined,
        updatedAt: Date.now(),
        updatedBy: user?._id,
      });
      count++;
    }
    return count;
  },
});

const normalizeConferenceKeyPart = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const conferenceMatchKey = (conference: { name: string; date: string; country: string }) =>
  `${normalizeConferenceKeyPart(conference.name)}|${normalizeConferenceKeyPart(conference.date)}|${normalizeConferenceKeyPart(conference.country)}`;

const delegateInfoFields = ["delegateFee", "earlyBirdDeadline", "includes", "delegateTypes"] as const;

const mergeMissingDelegateInfo = (existing: any, incoming: any) => {
  if (!incoming) return { changed: false, value: existing };
  if (!existing) return { changed: true, value: incoming };

  const merged = { ...existing };
  let changed = false;

  for (const field of delegateInfoFields) {
    const incomingValue = incoming[field];
    const existingValue = merged[field];
    if (incomingValue !== undefined && (existingValue === undefined || existingValue === null || existingValue === "" || (Array.isArray(existingValue) && existingValue.length === 0))) {
      merged[field] = incomingValue;
      changed = true;
    }
  }

  return { changed, value: merged };
};

export const bulkUpsertConferences = mutation({
  args: {
    conferences: v.array(v.object(bulkConferenceFields)),
  },
  returns: v.object({
    added: v.number(),
    updated: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    const now = Date.now();
    const existingConferences = await ctx.db.query("conferences").collect();
    const conferencesByKey = new Map<string, any>();

    for (const conference of existingConferences) {
      conferencesByKey.set(conferenceMatchKey(conference), conference);
    }

    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const incoming of args.conferences) {
      const name = incoming.name.trim();
      const date = incoming.date.trim();
      const country = incoming.country.trim();

      if (!name || !date || !country) {
        skipped++;
        continue;
      }

      const key = conferenceMatchKey({ name, date, country });
      const existing = conferencesByKey.get(key);

      if (existing) {
        const patch: Record<string, any> = {};
        const simpleFields = [
          "focus",
          "location",
          "description",
          "website",
          "attendees",
          "icon",
          "contactEmail",
          "speakerEmail",
          "speakerContact",
          "websiteSummary",
        ] as const;

        for (const field of simpleFields) {
          const incomingValue = incoming[field];
          const existingValue = existing[field];
          if (incomingValue !== undefined && (existingValue === undefined || existingValue === null || existingValue === "")) {
            patch[field] = incomingValue;
          }
        }

        if (incoming.delegateInfo !== undefined) {
          const mergedDelegateInfo = mergeMissingDelegateInfo(existing.delegateInfo, incoming.delegateInfo);
          if (mergedDelegateInfo.changed) {
            patch.delegateInfo = mergedDelegateInfo.value;
          }
        }

        if (incoming.isPublished !== undefined) {
          patch.isPublished = incoming.isPublished;
        }

        if (Object.keys(patch).length > 0) {
          patch.updatedAt = now;
          patch.updatedBy = user?._id;
          await ctx.db.patch(existing._id, patch);
          conferencesByKey.set(key, { ...existing, ...patch });
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

      const conferenceId = await ctx.db.insert("conferences", {
        name,
        focus: incoming.focus ?? "",
        date,
        location: incoming.location ?? "",
        country,
        description: incoming.description ?? "",
        website: incoming.website ?? "",
        attendees: incoming.attendees ?? "",
        icon: incoming.icon ?? "",
        contactEmail: incoming.contactEmail,
        speakerEmail: incoming.speakerEmail,
        speakerContact: incoming.speakerContact,
        delegateInfo: incoming.delegateInfo,
        isPublished: incoming.isPublished ?? false,
        isArchived: false,
        publishedAt: incoming.isPublished ? now : undefined,
        updatedAt: now,
        updatedBy: user?._id,
      });

      conferencesByKey.set(key, {
        _id: conferenceId,
        name,
        focus: incoming.focus ?? "",
        date,
        location: incoming.location ?? "",
        country,
        description: incoming.description ?? "",
        website: incoming.website ?? "",
        attendees: incoming.attendees ?? "",
        icon: incoming.icon ?? "",
        contactEmail: incoming.contactEmail,
        speakerEmail: incoming.speakerEmail,
        speakerContact: incoming.speakerContact,
        delegateInfo: incoming.delegateInfo,
        isPublished: incoming.isPublished ?? false,
        isArchived: false,
        publishedAt: incoming.isPublished ? now : undefined,
        updatedAt: now,
        updatedBy: user?._id,
      });
      added++;
    }

    return { added, updated, skipped };
  },
});

export const bulkUpdateConferenceWebsites = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("conferences"),
      website: v.string(),
    })),
  },
  returns: v.object({
    updated: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    const now = Date.now();
    let updated = 0;
    let skipped = 0;

    for (const update of args.updates) {
      const website = normalizeConferenceWebsiteUrl(update.website);
      if (!website) {
        skipped++;
        continue;
      }

      await ctx.db.patch(update.id, {
        website,
        updatedAt: now,
        updatedBy: user?._id,
      });
      updated++;
    }

    return { updated, skipped };
  },
});

const normalizeContactEmail = (rawEmail?: string | null) => {
  const value = (rawEmail || '').trim();
  if (!value) return null;
  const email = value.replace(/^mailto:/i, '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email.toLowerCase();
};

export const bulkUpdateConferenceContacts = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("conferences"),
      contactEmail: v.optional(v.string()),
      speakerEmail: v.optional(v.string()),
      speakerContact: v.optional(v.string()),
    })),
  },
  returns: v.object({
    updated: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getEditorUser(ctx);
    const now = Date.now();
    let updated = 0;
    let skipped = 0;

    for (const update of args.updates) {
      const patch: Record<string, any> = {};
      const contactEmail = normalizeContactEmail(update.contactEmail);
      const speakerEmail = normalizeContactEmail(update.speakerEmail);
      const speakerContact = (update.speakerContact || '').trim();

      if (contactEmail) patch.contactEmail = contactEmail;
      if (speakerEmail) patch.speakerEmail = speakerEmail;
      if (speakerContact) patch.speakerContact = speakerContact;

      if (Object.keys(patch).length === 0) {
        skipped++;
        continue;
      }

      patch.updatedAt = now;
      patch.updatedBy = user?._id;
      await ctx.db.patch(update.id, patch);
      updated++;
    }

    return { updated, skipped };
  },
});

const normalizeConferenceWebsiteUrl = (rawUrl?: string | null) => {
  const value = (rawUrl || "").trim().replace(/[),.;]+$/, "");
  if (!value) return null;
  if (/^(mailto:|tel:|sms:|https?:\/\/)/i.test(value)) return value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  return `https://${value}`;
};