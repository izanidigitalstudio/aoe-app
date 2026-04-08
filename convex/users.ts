import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get image URL");
    await ctx.db.patch(user._id, { image: url });
    return null;
  },
});

export const getCurrentUser = query({
args: {},
returns: v.union(
v.object({
_id: v.id("users"),
name: v.optional(v.string()),
image: v.optional(v.string()),
email: v.optional(v.string()),
bio: v.optional(v.string()),
company: v.optional(v.string()),
role: v.optional(v.string()),
industry: v.optional(v.string()),
country: v.optional(v.string()),
city: v.optional(v.string()),
linkedIn: v.optional(v.string()),
twitter: v.optional(v.string()),
website: v.optional(v.string()),
skills: v.optional(v.array(v.string())),
interests: v.optional(v.array(v.string())),
achievements: v.optional(v.string()),
currentProjects: v.optional(v.string()),
futureProjects: v.optional(v.string()),
contactEmail: v.optional(v.string()),
contactPhone: v.optional(v.string()),
onboarded: v.optional(v.boolean()),
isAdmin: v.optional(v.boolean()),
}),
v.null()
),
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);
if (!userId) return null;
const user = await ctx.db.get(userId);
if (!user) return null;
return {
_id: user._id,
name: user.name,
image: user.image,
email: user.email,
bio: user.bio,
company: user.company,
role: user.role,
industry: user.industry,
country: user.country,
city: user.city,
linkedIn: user.linkedIn,
twitter: user.twitter,
website: user.website,
skills: user.skills,
interests: user.interests,
achievements: user.achievements,
currentProjects: user.currentProjects,
futureProjects: user.futureProjects,
contactEmail: user.contactEmail,
contactPhone: user.contactPhone,
onboarded: user.onboarded,
isAdmin: user.isAdmin,
};
},
});

export const ensureCurrentUser = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    // If this auth user has no profile (no name or not onboarded),
    // try to find and merge from an existing onboarded profile with the same email
    if ((!user.name || !user.onboarded) && user.email) {
      const candidates = await ctx.db
        .query("users")
        .withIndex("email", (q: any) => q.eq("email", user.email))
        .collect();

      const profile = candidates.find(
        (c: any) => c._id !== userId && c.onboarded && c.name
      );

      if (profile) {
        const fields = [
          "name", "bio", "company", "role", "industry", "country", "city",
          "linkedIn", "twitter", "website", "skills", "interests",
          "achievements", "currentProjects", "futureProjects",
          "contactEmail", "contactPhone", "image", "onboarded", "memberType",
        ] as const;
        const mergeData: Record<string, any> = {};
        for (const f of fields) {
          const val = (profile as any)[f];
          if (val !== undefined && !(user as any)[f]) {
            mergeData[f] = val;
          }
        }
        if (Object.keys(mergeData).length > 0) {
          await ctx.db.patch(userId, mergeData);
        }

        // Re-attribute any content from the orphaned profile to this auth user
        const notices = await ctx.db
          .query("notices")
          .withIndex("by_author", (q: any) => q.eq("authorId", profile._id))
          .collect();
        for (const n of notices) {
          await ctx.db.patch(n._id, { authorId: userId });
        }
        const comments = await ctx.db
          .query("noticeComments")
          .collect();
        for (const c of comments) {
          if (c.authorId === profile._id) {
            await ctx.db.patch(c._id, { authorId: userId });
          }
        }
      }
    }

    return null;
  },
});

// One-time migration: fix split user records where auth users lack profile data
export const fixSplitUsers = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get all auth accounts to find auth-linked user IDs
    const accounts = await ctx.db.query("authAccounts").collect();
    const authUserIds = new Set(accounts.map((a: any) => a.userId as string));

    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    // Find auth users that need profile data
    const authUsersWithoutProfile = allUsers.filter(
      (u) => authUserIds.has(u._id) && (!u.name || !u.onboarded)
    );

    // Find orphaned profiles (onboarded users NOT linked to any auth account)
    const orphanedProfiles = allUsers.filter(
      (u) => !authUserIds.has(u._id) && u.onboarded && u.name
    );

    // First pass: merge by email
    for (const authUser of authUsersWithoutProfile) {
      if (!authUser.email) continue;
      const match = orphanedProfiles.find(
        (p) => p.email === authUser.email
      );
      if (match) {
        await mergeProfileInto(ctx, authUser._id, match, authUser);
      }
    }

    // Second pass: for auth users still without profile, try matching
    // orphaned profiles that have no email (can only match if there's exactly one)
    for (const authUser of authUsersWithoutProfile) {
      // Re-check if this user now has profile data (from first pass)
      const refreshed = await ctx.db.get(authUser._id);
      if (refreshed?.onboarded && refreshed?.name) continue;

      // Find orphaned profiles without email that haven't been matched yet
      const unmatchedOrphans = [];
      for (const p of orphanedProfiles) {
        if (!p.email) {
          // Check if this orphan was already merged (by checking if it was re-attributed)
          const stillOrphaned = await ctx.db.get(p._id);
          if (stillOrphaned) {
            unmatchedOrphans.push(p);
          }
        }
      }

      if (unmatchedOrphans.length === 1) {
        // Only one unmatched orphan - likely belongs to this auth user
        await mergeProfileInto(ctx, authUser._id, unmatchedOrphans[0], authUser);
      }
    }

    return null;
  },
});

async function mergeProfileInto(
  ctx: any,
  targetId: any,
  profile: any,
  currentUser: any,
) {
  const fields = [
    "name", "bio", "company", "role", "industry", "country", "city",
    "linkedIn", "twitter", "website", "skills", "interests",
    "achievements", "currentProjects", "futureProjects",
    "contactEmail", "contactPhone", "image", "onboarded", "memberType",
  ] as const;
  const mergeData: Record<string, any> = {};
  for (const f of fields) {
    const val = profile[f];
    if (val !== undefined && !currentUser[f]) {
      mergeData[f] = val;
    }
  }
  if (Object.keys(mergeData).length > 0) {
    await ctx.db.patch(targetId, mergeData);
  }

  // Re-attribute notices from orphaned profile to auth user
  const notices = await ctx.db
    .query("notices")
    .withIndex("by_author", (q: any) => q.eq("authorId", profile._id))
    .collect();
  for (const n of notices) {
    await ctx.db.patch(n._id, { authorId: targetId });
  }

  // Re-attribute comments
  const comments = await ctx.db.query("noticeComments").collect();
  for (const c of comments) {
    if (c.authorId === profile._id) {
      await ctx.db.patch(c._id, { authorId: targetId });
    }
  }

  // Re-attribute projects
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_author", (q: any) => q.eq("authorId", profile._id))
    .collect();
  for (const p of projects) {
    await ctx.db.patch(p._id, { authorId: targetId });
  }
}

export const patchUserAdmin = internalMutation({
  args: {
    userId: v.id("users"),
    fields: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, args.fields);
    return null;
  },
});

export const updateProfile = mutation({
args: {
name: v.optional(v.string()),
bio: v.optional(v.string()),
company: v.optional(v.string()),
role: v.optional(v.string()),
industry: v.optional(v.string()),
country: v.optional(v.string()),
city: v.optional(v.string()),
linkedIn: v.optional(v.string()),
twitter: v.optional(v.string()),
website: v.optional(v.string()),
skills: v.optional(v.array(v.string())),
interests: v.optional(v.array(v.string())),
achievements: v.optional(v.string()),
currentProjects: v.optional(v.string()),
futureProjects: v.optional(v.string()),
contactEmail: v.optional(v.string()),
contactPhone: v.optional(v.string()),
onboarded: v.optional(v.boolean()),
},
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
const user = await ctx.db.get(userId);
if (!user) throw new Error("User not found");
await ctx.db.patch(user._id, args);
return null;
},
});

const memberReturnType = v.object({
_id: v.id("users"),
name: v.optional(v.string()),
image: v.optional(v.string()),
company: v.optional(v.string()),
role: v.optional(v.string()),
industry: v.optional(v.string()),
country: v.optional(v.string()),
city: v.optional(v.string()),
bio: v.optional(v.string()),
achievements: v.optional(v.string()),
currentProjects: v.optional(v.string()),
futureProjects: v.optional(v.string()),
linkedIn: v.optional(v.string()),
twitter: v.optional(v.string()),
website: v.optional(v.string()),
contactEmail: v.optional(v.string()),
contactPhone: v.optional(v.string()),
physicalAddress: v.optional(v.string()),
skills: v.optional(v.array(v.string())),
interests: v.optional(v.array(v.string())),
});

export const listMembers = query({
args: {
industry: v.optional(v.string()),
country: v.optional(v.string()),
},
returns: v.array(memberReturnType),
handler: async (ctx, args) => {
let members = await ctx.db.query("users").order("desc").take(200);
members = members.filter((m) => m.onboarded);
members = members.filter((m) => m.memberType !== 'setas');
if (args.industry) {
members = members.filter((m) => m.industry === args.industry);
}
if (args.country) {
members = members.filter((m) => m.country === args.country);
}
return members.map((m) => ({
_id: m._id,
name: m.name,
image: m.image,
company: m.company,
role: m.role,
industry: m.industry,
country: m.country,
city: m.city,
bio: m.bio,
achievements: m.achievements,
currentProjects: m.currentProjects,
futureProjects: m.futureProjects,
linkedIn: m.linkedIn,
twitter: m.twitter,
website: m.website,
contactEmail: m.contactEmail,
contactPhone: m.contactPhone,
physicalAddress: m.physicalAddress,
skills: m.skills,
interests: m.interests,
}));
},
});

export const listFeaturedMembers = query({
  args: {},
  returns: v.array(memberReturnType),
  handler: async (ctx) => {
    const allMembers = await ctx.db.query("users").collect();
    const featured = allMembers
      .filter((m) => m.isDemo === true && m.onboarded && !!m.image)
      .slice(0, 20);
    return featured.map((m) => ({
      _id: m._id,
      name: m.name,
      image: m.image,
      company: m.company,
      role: m.role,
      industry: m.industry,
      country: m.country,
      city: m.city,
      bio: m.bio,
      achievements: m.achievements,
      currentProjects: m.currentProjects,
      futureProjects: m.futureProjects,
      linkedIn: m.linkedIn,
      twitter: m.twitter,
      website: m.website,
      contactEmail: m.contactEmail,
      contactPhone: m.contactPhone,
      physicalAddress: m.physicalAddress,
      skills: m.skills,
      interests: m.interests,
    }));
  },
});

export const getMember = query({
args: { memberId: v.id("users") },
returns: v.union(memberReturnType, v.null()),
handler: async (ctx, args) => {
const m = await ctx.db.get(args.memberId);
if (!m) return null;
return {
_id: m._id,
name: m.name,
image: m.image,
company: m.company,
role: m.role,
industry: m.industry,
country: m.country,
city: m.city,
bio: m.bio,
achievements: m.achievements,
currentProjects: m.currentProjects,
futureProjects: m.futureProjects,
linkedIn: m.linkedIn,
twitter: m.twitter,
website: m.website,
contactEmail: m.contactEmail,
contactPhone: m.contactPhone,
physicalAddress: m.physicalAddress,
skills: m.skills,
interests: m.interests,
};
},
});