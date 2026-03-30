import { pgTable, serial, text, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const automationTriggerEnum = pgEnum("automation_trigger", [
  "course_completed",
  "task_completed",
  "file_uploaded",
  "user_enrolled",
  "task_created",
]);

export const automationActionEnum = pgEnum("automation_action", [
  "assign_task",
  "notify_admin",
  "send_notification",
  "create_task",
  "enroll_course",
]);

export const automationsTable = pgTable("automations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  trigger: automationTriggerEnum("trigger").notNull(),
  condition: json("condition"),
  action: automationActionEnum("action").notNull(),
  actionConfig: json("action_config").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  runCount: integer("run_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAutomationSchema = createInsertSchema(automationsTable).omit({ id: true, createdAt: true, runCount: true });
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Automation = typeof automationsTable.$inferSelect;
