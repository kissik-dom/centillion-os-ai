import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    lastMessageAt: v.number(),
    preferredModel: v.optional(v.string()),
  })
    .index("by_user", ["userId", "lastMessageAt"]),
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
    modelUsed: v.optional(v.string()),
    taskType: v.optional(v.string()),
  })
    .index("by_conversation", ["conversationId", "createdAt"]),
});

export default schema;
