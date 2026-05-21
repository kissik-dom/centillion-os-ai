/* eslint-disable */
import type { DataModelFromSchemaDefinition } from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema.js";
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type Id<T extends string> = GenericId<T>;
