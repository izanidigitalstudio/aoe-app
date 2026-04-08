import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
...authTables,

users: defineTable({
name: v.optional(v.string()),
image: v.optional(v.string()),
email: v.optional(v.string()),
emailVerificationTime: v.optional(v.number()),
phone: v.optional(v.string()),
phoneVerificationTime: v.optional(v.number()),
isAnonymous: v.optional(v.boolean()),
// AOE-specific fields
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
physicalAddress: v.optional(v.string()),
memberType: v.optional(v.string()), // "platinum_network", "esd_corporate", "business_community", "entrepreneurs", "short_term_funders"
isDemo: v.optional(v.boolean()),
isAdmin: v.optional(v.boolean()),
onboarded: v.optional(v.boolean()),
}).index("email", ["email"])
  .index("by_onboarded", ["onboarded"])
  .index("by_member_type", ["memberType"]),

// "The Future is Here" Dinner Tour events
events: defineTable({
title: v.string(),
description: v.string(),
city: v.string(),
country: v.string(),
venue: v.string(),
date: v.number(),
imageUrl: v.optional(v.string()),
capacity: v.number(),
status: v.string(),
rsvpCount: v.optional(v.number()),
ticketPrice: v.optional(v.number()),
currency: v.optional(v.string()),
sortOrder: v.optional(v.number()),
category: v.optional(v.string()), // "dinner_tour", "ai_masterclass", "finance_tax"
sponsors: v.optional(v.array(v.object({
  name: v.string(),
  tier: v.string(), // "title", "gold", "silver", "bronze", "partner"
  logo: v.optional(v.string()),
  website: v.optional(v.string()),
}))),
guestSpeakers: v.optional(v.array(v.object({
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  designation: v.optional(v.string()),
  company: v.optional(v.string()),
  status: v.string(), // "invited", "confirmed", "declined", "tentative"
  notes: v.optional(v.string()),
}))),
invitedGuests: v.optional(v.array(v.object({
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  designation: v.optional(v.string()),
  company: v.optional(v.string()),
  status: v.string(), // "invited", "confirmed", "declined", "tentative"
  notes: v.optional(v.string()),
}))),
paidGuests: v.optional(v.array(v.object({
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  designation: v.optional(v.string()),
  company: v.optional(v.string()),
  amountPaid: v.optional(v.number()),
  paymentMethod: v.optional(v.string()),
  paymentRef: v.optional(v.string()),
  notes: v.optional(v.string()),
}))),
}).index("by_status", ["status"])
.index("by_country", ["country"])
.index("by_sort_order", ["sortOrder"])
.index("by_category", ["category"]),

eventRsvps: defineTable({
eventId: v.id("events"),
userId: v.id("users"),
status: v.string(), // "attending", "waitlist", "cancelled"
}).index("by_event", ["eventId"])
.index("by_user", ["userId"])
.index("by_event_and_user", ["eventId", "userId"]),

// Member projects/innovations
projects: defineTable({
authorId: v.id("users"),
title: v.string(),
description: v.string(),
industry: v.string(),
stage: v.string(), // "idea", "prototype", "mvp", "growth", "scale"
aiIntegration: v.string(),
resourcesNeeded: v.array(v.string()),
lookingFor: v.array(v.string()), // "funding", "technical", "partnership", "mentorship"
tags: v.array(v.string()),
imageUrl: v.optional(v.string()),
likesCount: v.optional(v.number()),
}).index("by_author", ["authorId"])
.index("by_industry", ["industry"])
.index("by_stage", ["stage"]),

projectLikes: defineTable({
projectId: v.id("projects"),
userId: v.id("users"),
}).index("by_project", ["projectId"])
.index("by_project_and_user", ["projectId", "userId"]),

projectComments: defineTable({
projectId: v.id("projects"),
authorId: v.id("users"),
content: v.string(),
}).index("by_project", ["projectId"]),

// AI Resources / Articles
aiResources: defineTable({
title: v.string(),
summary: v.string(),
content: v.string(),
category: v.string(), // "news", "tutorial", "tool", "case-study", "guide"
tags: v.array(v.string()),
imageUrl: v.optional(v.string()),
sourceUrl: v.optional(v.string()),
featured: v.optional(v.boolean()),
}).index("by_category", ["category"])
.index("by_featured", ["featured"]),

// Direct messages between members
conversations: defineTable({
participantIds: v.array(v.id("users")),
lastMessageAt: v.optional(v.number()),
}).index("by_lastMessage", ["lastMessageAt"]),

messages: defineTable({
conversationId: v.id("conversations"),
senderId: v.id("users"),
content: v.string(),
}).index("by_conversation", ["conversationId"]),

// Connection requests between members
connections: defineTable({
fromUserId: v.id("users"),
toUserId: v.id("users"),
status: v.string(), // "pending", "accepted", "rejected"
}).index("by_from_user", ["fromUserId"])
.index("by_to_user", ["toUserId"])
.index("by_from_and_to", ["fromUserId", "toUserId"]),

// Payments tracking for dinner tour events
payments: defineTable({
  eventId: v.optional(v.id("events")),
  userId: v.optional(v.id("users")),
  amount: v.number(),
  currency: v.string(),
  method: v.string(), // "stripe", "bank_transfer", "mobile_money", "cash", "other"
  status: v.string(), // "pending", "confirmed", "failed", "refunded"
  reference: v.optional(v.string()),
  notes: v.optional(v.string()),
  confirmedBy: v.optional(v.string()),
  confirmedAt: v.optional(v.number()),
}).index("by_event", ["eventId"])
  .index("by_user", ["userId"])
  .index("by_status", ["status"]),

// Admin CRM notes on members
adminNotes: defineTable({
  memberId: v.id("users"),
  note: v.string(),
  type: v.string(), // "general", "follow_up", "meeting", "call", "email"
  createdBy: v.optional(v.string()),
}).index("by_member", ["memberId"]),

// Conference participation requests
conferenceRequests: defineTable({
  userId: v.id("users"),
  conferenceName: v.string(),
  fullName: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  company: v.optional(v.string()),
  designation: v.optional(v.string()),
  delegateType: v.string(),
  specialRequirements: v.optional(v.string()),
  status: v.string(),
}).index("by_user", ["userId"])
  .index("by_conference", ["conferenceName"])
  .index("by_user_and_conference", ["userId", "conferenceName"])
  .index("by_status", ["status"]),

// Notice Board - community posts for events, projects, activities
notices: defineTable({
  authorId: v.id("users"),
  title: v.optional(v.string()),
  description: v.string(),
  category: v.string(), // "event", "project", "activity", "announcement"
  date: v.optional(v.number()), // for events
  location: v.optional(v.string()), // for events/activities
  tags: v.optional(v.array(v.string())),
  interestCount: v.optional(v.number()),
  commentCount: v.optional(v.number()),
}).index("by_author", ["authorId"])
  .index("by_category", ["category"]),

noticeComments: defineTable({
  noticeId: v.id("notices"),
  authorId: v.id("users"),
  content: v.string(),
}).index("by_notice", ["noticeId"]),

noticeInterests: defineTable({
  noticeId: v.id("notices"),
  userId: v.id("users"),
}).index("by_notice", ["noticeId"])
  .index("by_notice_and_user", ["noticeId", "userId"])
  .index("by_user", ["userId"]),

conferences: defineTable({
  name: v.string(),
  focus: v.string(), // "AI", "Technology", "Investment", "Entrepreneurship", "Infrastructure"
  date: v.string(),
  location: v.string(),
  country: v.string(),
  description: v.string(),
  website: v.string(),
  attendees: v.string(),
  icon: v.string(),
  contactEmail: v.optional(v.string()),
  speakerEmail: v.optional(v.string()),
  delegateInfo: v.optional(v.object({
    delegateFee: v.optional(v.string()),
    earlyBirdDeadline: v.optional(v.string()),
    includes: v.optional(v.array(v.string())),
    delegateTypes: v.optional(v.array(v.string())),
  })),
}).index("by_country", ["country"])
  .index("by_focus", ["focus"])
  .index("by_date", ["date"]),
});