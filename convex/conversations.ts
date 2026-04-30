import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
    return conversations;
  },
});

export const create = mutation({
  args: { title: v.optional(v.string()) },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const id = await ctx.db.insert("conversations", {
      userId,
      title: args.title || "New Chat",
      lastMessageAt: Date.now(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const conv = await ctx.db.get(args.id);
    if (!conv || conv.userId !== userId) throw new Error("Not found");
    // Delete all messages in conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.id))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const updateTitle = mutation({
  args: { id: v.id("conversations"), title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const conv = await ctx.db.get(args.id);
    if (!conv || conv.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { title: args.title });
  },
});
