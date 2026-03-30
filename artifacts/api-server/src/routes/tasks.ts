import { Router, type IRouter } from "express";
import { db, tasksTable, commentsTable, usersTable, activityLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getTaskWithUsers(taskId: number) {
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId)).limit(1);
  if (!task) return null;

  let assignee = null;
  if (task.assigneeId) {
    const [u] = await db.select({
      id: usersTable.id, name: usersTable.name, email: usersTable.email,
      role: usersTable.role, department: usersTable.department,
      avatarUrl: usersTable.avatarUrl, isActive: usersTable.isActive, createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, task.assigneeId)).limit(1);
    assignee = u ?? null;
  }

  const [createdBy] = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email,
    role: usersTable.role, department: usersTable.department,
    avatarUrl: usersTable.avatarUrl, isActive: usersTable.isActive, createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, task.createdById)).limit(1);

  return { ...task, assignee, createdBy: createdBy ?? null };
}

router.get("/", async (req, res) => {
  const { status, assigneeId, priority } = req.query;

  let tasks = await db.select().from(tasksTable).orderBy(tasksTable.createdAt);

  if (status) tasks = tasks.filter(t => t.status === status);
  if (assigneeId) tasks = tasks.filter(t => t.assigneeId === parseInt(assigneeId as string));
  if (priority) tasks = tasks.filter(t => t.priority === priority);

  const result = await Promise.all(tasks.map(t => getTaskWithUsers(t.id)));
  res.json(result.filter(Boolean));
});

router.post("/", async (req, res) => {
  const { title, description, status, priority, assigneeId, createdById, dueDate } = req.body;
  if (!title || !status || !priority || !createdById) {
    res.status(400).json({ error: "Bad request", message: "Missing required fields" });
    return;
  }

  const [task] = await db.insert(tasksTable).values({
    title, description, status, priority,
    assigneeId: assigneeId ?? null,
    createdById,
    dueDate: dueDate ? new Date(dueDate) : null,
  }).returning();

  await db.insert(activityLogsTable).values({
    userId: createdById,
    action: "created",
    entityType: "task",
    entityId: task.id,
    metadata: { title },
  });

  const result = await getTaskWithUsers(task.id);
  res.status(201).json(result);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const task = await getTaskWithUsers(id);
  if (!task) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(task);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, status, priority, assigneeId, dueDate } = req.body;

  const [task] = await db.update(tasksTable).set({
    title, description, status, priority,
    assigneeId: assigneeId ?? null,
    dueDate: dueDate ? new Date(dueDate) : null,
    updatedAt: new Date(),
  }).where(eq(tasksTable.id, id)).returning();

  if (!task) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const result = await getTaskWithUsers(task.id);
  res.json(result);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  res.json({ success: true, message: "Task deleted" });
});

router.get("/:id/comments", async (req, res) => {
  const taskId = parseInt(req.params.id);
  const comments = await db.select().from(commentsTable).where(eq(commentsTable.taskId, taskId));

  const result = await Promise.all(comments.map(async (c) => {
    const [user] = await db.select({
      id: usersTable.id, name: usersTable.name, email: usersTable.email,
      role: usersTable.role, department: usersTable.department,
      avatarUrl: usersTable.avatarUrl, isActive: usersTable.isActive, createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, c.userId)).limit(1);
    return { ...c, user: user ?? null };
  }));

  res.json(result);
});

router.post("/:id/comments", async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { userId, content } = req.body;

  const [comment] = await db.insert(commentsTable).values({ taskId, userId, content }).returning();

  const [user] = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email,
    role: usersTable.role, department: usersTable.department,
    avatarUrl: usersTable.avatarUrl, isActive: usersTable.isActive, createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  res.status(201).json({ ...comment, user: user ?? null });
});

export default router;
