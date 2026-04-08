import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendRequest = mutation({
args: { toUserId: v.id("users") },
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
const user = await ctx.db.get(userId);
if (!user) throw new Error("User not found");
if (user._id === args.toUserId) throw new Error("Cannot connect with yourself");

const existing = await ctx.db
.query("connections")
.withIndex("by_from_and_to", (q) =>
q.eq("fromUserId", user._id).eq("toUserId", args.toUserId)
)
.unique();
if (existing) throw new Error("Connection already exists");

const reverse = await ctx.db
.query("connections")
.withIndex("by_from_and_to", (q) =>
q.eq("fromUserId", args.toUserId).eq("toUserId", user._id)
)
.unique();
if (reverse) throw new Error("Connection already exists");

await ctx.db.insert("connections", {
fromUserId: user._id,
toUserId: args.toUserId,
status: "pending",
});
return null;
},
});

export const respondToRequest = mutation({
args: {
connectionId: v.id("connections"),
accept: v.boolean(),
},
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
const user = await ctx.db.get(userId);
if (!user) throw new Error("User not found");

const connection = await ctx.db.get(args.connectionId);
if (!connection) throw new Error("Connection not found");
if (connection.toUserId !== user._id) throw new Error("Not authorized");

await ctx.db.patch(args.connectionId, {
status: args.accept ? "accepted" : "rejected",
});
return null;
},
});

export const getMyConnections = query({
args: {},
returns: v.array(
v.object({
_id: v.id("connections"),
userId: v.id("users"),
name: v.optional(v.string()),
image: v.optional(v.string()),
company: v.optional(v.string()),
role: v.optional(v.string()),
country: v.optional(v.string()),
status: v.string(),
isIncoming: v.boolean(),
})
),
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);
if (!userId) return [];
const user = await ctx.db.get(userId);
if (!user) return [];

const sent = await ctx.db
.query("connections")
.withIndex("by_from_user", (q) => q.eq("fromUserId", user._id))
.collect();

const received = await ctx.db
.query("connections")
.withIndex("by_to_user", (q) => q.eq("toUserId", user._id))
.collect();

const results = [];

for (const conn of sent) {
const other = await ctx.db.get(conn.toUserId);
if (other) {
results.push({
_id: conn._id,
userId: other._id,
name: other.name,
image: other.image,
company: other.company,
role: other.role,
country: other.country,
status: conn.status,
isIncoming: false,
});
}
}

for (const conn of received) {
const other = await ctx.db.get(conn.fromUserId);
if (other) {
results.push({
_id: conn._id,
userId: other._id,
name: other.name,
image: other.image,
company: other.company,
role: other.role,
country: other.country,
status: conn.status,
isIncoming: true,
});
}
}

return results;
},
});