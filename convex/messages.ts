import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    // Verify user owns this conversation
    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== userId) return [];
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
    return messages;
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== userId) throw new Error("Not found");
    const id = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });
    // Update conversation timestamp and title if first message
    const msgCount = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
    const updates: { lastMessageAt: number; title?: string } = { lastMessageAt: Date.now() };
    if (msgCount.length <= 1) {
      updates.title = args.content.slice(0, 60) + (args.content.length > 60 ? "..." : "");
    }
    await ctx.db.patch(args.conversationId, updates);
    return id;
  },
});

export const addAssistant = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== userId) throw new Error("Not found");
    const id = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "assistant",
      content: args.content,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.conversationId, { lastMessageAt: Date.now() });
    return id;
  },
});
