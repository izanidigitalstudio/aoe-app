import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const projectReturnValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  authorId: v.id("users"),
  authorName: v.optional(v.string()),
  authorImage: v.optional(v.string()),
  authorCompany: v.optional(v.string()),
  title: v.string(),
  description: v.string(),
  industry: v.string(),
  stage: v.string(),
  aiIntegration: v.string(),
  resourcesNeeded: v.array(v.string()),
  lookingFor: v.array(v.string()),
  tags: v.array(v.string()),
  imageUrl: v.optional(v.string()),
  likesCount: v.number(),
  commentsCount: v.number(),
  isLiked: v.boolean(),
});

export const listProjects = query({
  args: {
    industry: v.optional(v.string()),
    stage: v.optional(v.string()),
  },
  returns: v.array(projectReturnValidator),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    let projectsQuery;
    if (args.industry) {
      projectsQuery = ctx.db
        .query("projects")
        .withIndex("by_industry", (q) => q.eq("industry", args.industry!))
        .order("desc");
    } else {
      projectsQuery = ctx.db.query("projects").order("desc");
    }

    const projects = await projectsQuery.take(30);
    const results = [];

    for (const project of projects) {
      const author = await ctx.db.get(project.authorId);
      const comments = await ctx.db
        .query("projectComments")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();

      let isLiked = false;
      if (currentUserId) {
        const like = await ctx.db
          .query("projectLikes")
          .withIndex("by_project_and_user", (q) =>
            q.eq("projectId", project._id).eq("userId", currentUserId)
          )
          .unique();
        isLiked = !!like;
      }

      results.push({
        _id: project._id,
        _creationTime: project._creationTime,
        authorId: project.authorId,
        authorName: author?.name,
        authorImage: author?.image,
        authorCompany: author?.company,
        title: project.title,
        description: project.description,
        industry: project.industry,
        stage: project.stage,
        aiIntegration: project.aiIntegration,
        resourcesNeeded: project.resourcesNeeded,
        lookingFor: project.lookingFor,
        tags: project.tags,
        imageUrl: project.imageUrl,
        likesCount: project.likesCount ?? 0,
        commentsCount: comments.length,
        isLiked,
      });
    }

    return results;
  },
});

export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    industry: v.string(),
    stage: v.string(),
    aiIntegration: v.string(),
    resourcesNeeded: v.array(v.string()),
    lookingFor: v.array(v.string()),
    tags: v.array(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("projects", {
      ...args,
      authorId: user._id,
      likesCount: 0,
    });
  },
});

export const toggleLike = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("projectLikes")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", user._id)
      )
      .unique();

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.projectId, {
        likesCount: Math.max(0, (project.likesCount ?? 0) - 1),
      });
    } else {
      await ctx.db.insert("projectLikes", {
        projectId: args.projectId,
        userId: user._id,
      });
      await ctx.db.patch(args.projectId, {
        likesCount: (project.likesCount ?? 0) + 1,
      });
    }
    return null;
  },
});

export const addComment = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.insert("projectComments", {
      projectId: args.projectId,
      authorId: user._id,
      content: args.content,
    });
    return null;
  },
});

export const getProjectComments = query({
  args: { projectId: v.id("projects") },
  returns: v.array(
    v.object({
      _id: v.id("projectComments"),
      _creationTime: v.number(),
      content: v.string(),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("projectComments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(50);

    const results = [];
    for (const comment of comments) {
      const author = await ctx.db.get(comment.authorId);
      results.push({
        _id: comment._id,
        _creationTime: comment._creationTime,
        content: comment.content,
        authorName: author?.name,
        authorImage: author?.image,
      });
    }
    return results;
  },
});