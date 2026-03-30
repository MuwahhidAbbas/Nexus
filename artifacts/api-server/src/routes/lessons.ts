import { Router, type IRouter } from "express";
import { db, lessonsTable, progressTable, modulesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/modules/:moduleId/lessons", async (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, moduleId)).orderBy(lessonsTable.order);
  res.json(lessons);
});

router.post("/modules/:moduleId/lessons", async (req, res) => {
  const moduleId = parseInt(req.params.moduleId);
  const { title, content, videoUrl, duration, order } = req.body;
  const [lesson] = await db.insert(lessonsTable).values({ moduleId, title, content, videoUrl, duration, order }).returning();
  res.status(201).json(lesson);
});

router.post("/lessons/:lessonId/complete", async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  const { userId } = req.body;

  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const [mod] = await db.select().from(modulesTable).where(eq(modulesTable.id, lesson.moduleId)).limit(1);
  if (!mod) {
    res.status(404).json({ error: "Module not found" });
    return;
  }

  const existing = await db.select().from(progressTable).where(
    and(
      eq(progressTable.userId, userId),
      eq(progressTable.courseId, mod.courseId),
      eq(progressTable.lessonId, lessonId)
    )
  ).limit(1);

  let progress;
  if (existing.length > 0) {
    [progress] = await db.update(progressTable).set({
      status: "completed",
      completedAt: new Date(),
    }).where(eq(progressTable.id, existing[0].id)).returning();
  } else {
    [progress] = await db.insert(progressTable).values({
      userId,
      courseId: mod.courseId,
      lessonId,
      status: "completed",
      completedAt: new Date(),
    }).returning();
  }

  const [user] = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    department: usersTable.department,
    avatarUrl: usersTable.avatarUrl,
    isActive: usersTable.isActive,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  res.json({ ...progress, user: user ?? null });
});

export default router;
