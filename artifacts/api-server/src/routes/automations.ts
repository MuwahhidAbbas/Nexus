import { Router, type IRouter } from "express";
import { db, automationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const automations = await db.select().from(automationsTable).orderBy(automationsTable.createdAt);
  res.json(automations);
});

router.post("/", async (req, res) => {
  const { name, description, trigger, condition, action, actionConfig, isActive } = req.body;
  if (!name || !trigger || !action || !actionConfig) {
    res.status(400).json({ error: "Bad request", message: "Missing required fields" });
    return;
  }

  const [automation] = await db.insert(automationsTable).values({
    name, description, trigger, condition: condition ?? null, action, actionConfig, isActive: isActive ?? true
  }).returning();

  res.status(201).json(automation);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description, trigger, condition, action, actionConfig, isActive } = req.body;

  const [automation] = await db.update(automationsTable).set({
    name, description, trigger, condition: condition ?? null, action, actionConfig, isActive
  }).where(eq(automationsTable.id, id)).returning();

  if (!automation) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(automation);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(automationsTable).where(eq(automationsTable.id, id));
  res.json({ success: true, message: "Automation deleted" });
});

export default router;
