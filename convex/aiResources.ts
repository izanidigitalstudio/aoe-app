import { query } from "./_generated/server";
import { v } from "convex/values";

export const listResources = query({
args: {
category: v.optional(v.string()),
},
returns: v.array(
v.object({
_id: v.id("aiResources"),
_creationTime: v.number(),
title: v.string(),
summary: v.string(),
content: v.string(),
category: v.string(),
tags: v.array(v.string()),
imageUrl: v.optional(v.string()),
sourceUrl: v.optional(v.string()),
featured: v.optional(v.boolean()),
})
),
handler: async (ctx, args) => {
    let resourcesQuery;
    if (args.category) {
        resourcesQuery = ctx.db
            .query("aiResources")
            .withIndex("by_category", (q) => q.eq("category", args.category!))
            .order("desc");
    } else {
        resourcesQuery = ctx.db.query("aiResources").order("desc");
    }

    const resources = await resourcesQuery.take(30);
    return resources.map((r) => ({
        _id: r._id,
        _creationTime: r._creationTime,
        title: r.title,
        summary: r.summary,
        content: r.content,
        category: r.category,
        tags: r.tags,
        imageUrl: r.imageUrl,
        sourceUrl: r.sourceUrl,
        featured: r.featured,
    }));
},
});

export const getFeaturedResources = query({
args: {},
returns: v.array(
v.object({
_id: v.id("aiResources"),
title: v.string(),
summary: v.string(),
category: v.string(),
imageUrl: v.optional(v.string()),
})
),
handler: async (ctx) => {
    const resources = await ctx.db
        .query("aiResources")
        .withIndex("by_featured", (q) => q.eq("featured", true))
        .order("desc")
        .take(5);
    return resources.map((r) => ({
        _id: r._id,
        title: r.title,
        summary: r.summary,
        category: r.category,
        imageUrl: r.imageUrl,
    }));
},
});