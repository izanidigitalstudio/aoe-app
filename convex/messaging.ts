import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrCreateConversation = mutation({
args: { otherUserId: v.id("users") },
returns: v.id("conversations"),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
const user = await ctx.db.get(userId);
if (!user) throw new Error("User not found");

// Check for existing conversation between these two users
const allConvos = await ctx.db.query("conversations").collect();
for (const convo of allConvos) {
const ids = convo.participantIds;
if (
ids.length === 2 &&
ids.includes(user._id) &&
ids.includes(args.otherUserId)
) {
return convo._id;
}
}

// Create new conversation
const convoId = await ctx.db.insert("conversations", {
participantIds: [user._id, args.otherUserId],
lastMessageAt: Date.now(),
});
return convoId;
},
});

export const sendMessage = mutation({
args: {
conversationId: v.id("conversations"),
content: v.string(),
},
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
const user = await ctx.db.get(userId);
if (!user) throw new Error("User not found");

const convo = await ctx.db.get(args.conversationId);
if (!convo || !convo.participantIds.includes(user._id)) {
throw new Error("Not authorized");
}

await ctx.db.insert("messages", {
conversationId: args.conversationId,
senderId: user._id,
content: args.content,
});

await ctx.db.patch(args.conversationId, {
lastMessageAt: Date.now(),
});

return null;
},
});

export const getMessages = query({
args: { conversationId: v.id("conversations") },
returns: v.array(
v.object({
_id: v.id("messages"),
_creationTime: v.number(),
senderId: v.id("users"),
senderName: v.optional(v.string()),
senderImage: v.optional(v.string()),
content: v.string(),
isMine: v.boolean(),
})
),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) return [];
const user = await ctx.db.get(userId);
if (!user) return [];

const messages = await ctx.db
.query("messages")
.withIndex("by_conversation", (q) =>
q.eq("conversationId", args.conversationId)
)
.order("asc")
.collect();

const results = [];
for (const msg of messages) {
const sender = await ctx.db.get(msg.senderId);
results.push({
_id: msg._id,
_creationTime: msg._creationTime,
senderId: msg.senderId,
senderName: sender?.name,
senderImage: sender?.image,
content: msg.content,
isMine: msg.senderId === user._id,
});
}
return results;
},
});

export const getMyConversations = query({
args: {},
returns: v.array(
v.object({
_id: v.id("conversations"),
otherUserId: v.id("users"),
otherUserName: v.optional(v.string()),
otherUserImage: v.optional(v.string()),
otherUserCompany: v.optional(v.string()),
otherUserRole: v.optional(v.string()),
lastMessage: v.optional(v.string()),
lastMessageAt: v.optional(v.number()),
})
),
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);
if (!userId) return [];
const user = await ctx.db.get(userId);
if (!user) return [];

const allConvos = await ctx.db.query("conversations").order("desc").take(100);
const myConvos = allConvos.filter((c) =>
c.participantIds.includes(user._id)
);

const results = [];
for (const convo of myConvos) {
const otherId = convo.participantIds.find((id) => id !== user._id);
if (!otherId) continue;
const other = await ctx.db.get(otherId);
if (!other) continue;

const lastMsg = await ctx.db
.query("messages")
.withIndex("by_conversation", (q) =>
q.eq("conversationId", convo._id)
)
.order("desc")
.first();

results.push({
_id: convo._id,
otherUserId: otherId,
otherUserName: other.name,
otherUserImage: other.image,
otherUserCompany: other.company,
otherUserRole: other.role,
lastMessage: lastMsg?.content,
lastMessageAt: convo.lastMessageAt,
});
}

return results.sort(
(a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0)
);
},
});