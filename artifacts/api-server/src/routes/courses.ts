import { Router, type IRouter } from "express";
import { db, coursesTable, modulesTable, lessonsTable, progressTable, enrollmentsTable, usersTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { status, search } = req.query;

  let courses = await db.select().from(coursesTable);

  if (status) courses = courses.filter(c => c.status === status);
  if (search) {
    const s = (search as string).toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(s));
  }

  const result = await Promise.all(courses.map(async (course) => {
    const [{ count: enrolledCount }] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, course.id));
    const completedProgress = await db.select().from(progressTable).where(and(eq(progressTable.courseId, course.id), eq(progressTable.status, "completed")));
    const totalEnrolled = Number(enrolledCount);
    const completionRate = totalEnrolled > 0 ? (completedProgress.length / totalEnrolled) * 100 : 0;

    return {
      ...course,
      enrolledCount: totalEnrolled,
      completionRate: Math.round(completionRate * 10) / 10,
    };
  }));

  res.json(result);
});

router.post("/", async (req, res) => {
  const { title, description, thumbnailUrl, status, duration, createdById } = req.body;
  if (!title || !status || !createdById) {
    res.status(400).json({ error: "Bad request", message: "Missing required fields" });
    return;
  }

  const [course] = await db.insert(coursesTable).values({
    title, description, thumbnailUrl, status, duration, createdById
  }).returning();

  res.status(201).json({ ...course, enrolledCount: 0, completionRate: 0 });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id)).limit(1);
  
  if (!course) {
    res.status(404).json({ error: "Not found", message: "Course not found" });
    return;
  }

  const modules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, id)).orderBy(modulesTable.order);
  const modulesWithLessons = await Promise.all(modules.map(async (mod) => {
    const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, mod.id)).orderBy(lessonsTable.order);
    return { ...mod, lessons };
  }));

  const [{ count: enrolledCount }] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, id));
  const completedProgress = await db.select().from(progressTable).where(and(eq(progressTable.courseId, id), eq(progressTable.status, "completed")));
  const totalEnrolled = Number(enrolledCount);
  const completionRate = totalEnrolled > 0 ? (completedProgress.length / totalEnrolled) * 100 : 0;

  res.json({
    ...course,
    enrolledCount: totalEnrolled,
    completionRate: Math.round(completionRate * 10) / 10,
    modules: modulesWithLessons,
  });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, thumbnailUrl, status, duration } = req.body;

  const [course] = await db.update(coursesTable).set({
    title, description, thumbnailUrl, status, duration,
    updatedAt: new Date(),
  }).where(eq(coursesTable.id, id)).returning();

  if (!course) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...course, enrolledCount: 0, completionRate: 0 });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(coursesTable).where(eq(coursesTable.id, id));
  res.json({ success: true, message: "Course deleted" });
});

router.post("/:id/enroll", async (req, res) => {
  const courseId = parseInt(req.params.id);
  const { userId } = req.body;

  await db.insert(enrollmentsTable).values({ courseId, userId }).onConflictDoNothing();
  res.json({ success: true, message: "Enrolled" });
});

router.get("/:id/progress", async (req, res) => {
  const courseId = parseInt(req.params.id);
  const progressList = await db.select().from(progressTable).where(eq(progressTable.courseId, courseId));
  
  const result = await Promise.all(progressList.map(async (p) => {
    const [user] = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      department: usersTable.department,
      avatarUrl: usersTable.avatarUrl,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, p.userId)).limit(1);
    return { ...p, user: user ?? null };
  }));

  res.json(result);
});

router.get("/:courseId/modules", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const modules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, courseId)).orderBy(modulesTable.order);
  res.json(modules);
});

router.post("/:courseId/modules", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const { title, description, order } = req.body;
  const [mod] = await db.insert(modulesTable).values({ courseId, title, description, order }).returning();
  res.status(201).json(mod);
});

export default router;
