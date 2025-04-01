import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operator"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

// Quantum Glyph schema
export const glyphs = pgTable("glyphs", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGlyphSchema = createInsertSchema(glyphs).pick({
  symbol: true,
  name: true,
  description: true,
  code: true,
});

// Logic Module schema
export const logicModules = pgTable("logic_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLogicModuleSchema = createInsertSchema(logicModules).pick({
  name: true,
  description: true,
  type: true,
  status: true,
});

// Quantum Service schema
export const quantumServices = pgTable("quantum_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  provider: text("provider").notNull(),
  endpoint: text("endpoint").notNull(),
  status: text("status").notNull().default("active"),
  credentials: jsonb("credentials"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuantumServiceSchema = createInsertSchema(quantumServices).pick({
  name: true,
  provider: true,
  endpoint: true,
  status: true,
  credentials: true,
});

// Mission schema
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  missionId: text("mission_id").notNull().unique(),
  name: text("name").notNull(),
  glyphId: integer("glyph_id").notNull(),
  target: text("target").notNull(),
  status: text("status").notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  config: jsonb("config"),
  result: jsonb("result"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMissionSchema = createInsertSchema(missions).pick({
  name: true,
  glyphId: true,
  target: true,
  userId: true,
  serviceId: true,
  config: true,
});

// Mission Logic Mappings (many-to-many)
export const missionLogics = pgTable("mission_logics", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").notNull(),
  logicId: integer("logic_id").notNull(),
});

export const insertMissionLogicSchema = createInsertSchema(missionLogics).pick({
  missionId: true,
  logicId: true,
});

// Authentication schema
export const authTokens = pgTable("auth_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuthTokenSchema = createInsertSchema(authTokens).pick({
  userId: true,
  token: true,
  expires: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Glyph = typeof glyphs.$inferSelect;
export type InsertGlyph = z.infer<typeof insertGlyphSchema>;

export type LogicModule = typeof logicModules.$inferSelect;
export type InsertLogicModule = z.infer<typeof insertLogicModuleSchema>;

export type QuantumService = typeof quantumServices.$inferSelect;
export type InsertQuantumService = z.infer<typeof insertQuantumServiceSchema>;

export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;

export type MissionLogic = typeof missionLogics.$inferSelect;
export type InsertMissionLogic = z.infer<typeof insertMissionLogicSchema>;

export type AuthToken = typeof authTokens.$inferSelect;
export type InsertAuthToken = z.infer<typeof insertAuthTokenSchema>;
