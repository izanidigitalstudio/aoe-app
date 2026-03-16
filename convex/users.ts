import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();
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
const identity = await ctx.auth.getUserIdentity();
if (!identity) return null;
const user = await ctx.db
.query("users")
.withIndex("email", (q) => q.eq("email", identity.email))
.unique();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();
    if (existing) return null;
    await ctx.db.insert("users", {
      email: identity.email ?? undefined,
      name: identity.name ?? undefined,
      image: identity.pictureUrl ?? undefined,
      onboarded: false,
    });
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
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");
const user = await ctx.db
.query("users")
.withIndex("email", (q) => q.eq("email", identity.email))
.unique();
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
skills: m.skills,
interests: m.interests,
};
},
});