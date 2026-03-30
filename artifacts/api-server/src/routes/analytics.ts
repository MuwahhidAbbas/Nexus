import { Router, type IRouter } from "express";
import { db, usersTable, coursesTable, tasksTable, filesTable, automationsTable, activityLogsTable } from "@workspace/db";
import { count, eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard", async (req, res) => {
  const [{ count: totalUsers }] = await db.select({ count: count() }).from(usersTable);
  const [{ count: activeUsers }] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.isActive, true));
  const [{ count: totalCourses }] = await db.select({ count: count() }).from(coursesTable);
  const [{ count: activeCourses }] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.status, "published"));
  const [{ count: totalTasks }] = await db.select({ count: count() }).from(tasksTable);
  const [{ count: completedTasks }] = await db.select({ count: count() }).from(tasksTable).where(eq(tasksTable.status, "completed"));
  const [{ count: todoTasks }] = await db.select({ count: count() }).from(tasksTable).where(eq(tasksTable.status, "todo"));
  const [{ count: inProgressTasks }] = await db.select({ count: count() }).from(tasksTable).where(eq(tasksTable.status, "in_progress"));
  const [{ count: totalFiles }] = await db.select({ count: count() }).from(filesTable);
  const [{ count: activeAutomations }] = await db.select({ count: count() }).from(automationsTable).where(eq(automationsTable.isActive, true));
  const [{ count: draftCourses }] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.status, "draft"));
  const [{ count: archivedCourses }] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.status, "archived"));

  const totalT = Number(totalTasks);
  const completedT = Number(completedTasks);
  const taskCompletionRate = totalT > 0 ? Math.round((completedT / totalT) * 1000) / 10 : 0;

  const recentLogs = await db.select().from(activityLogsTable).orderBy(desc(activityLogsTable.createdAt)).limit(10);
  const recentActivity = await Promise.all(recentLogs.map(async (log) => {
    let user = null;
    if (log.userId) {
      const [u] = await db.select({
        id: usersTable.id, name: usersTable.name, email: usersTable.email,
        role: usersTable.role, department: usersTable.department,
        avatarUrl: usersTable.avatarUrl, isActive: usersTable.isActive, createdAt: usersTable.createdAt,
      }).from(usersTable).where(eq(usersTable.id, log.userId)).limit(1);
      user = u ?? null;
    }
    return { ...log, user };
  }));

  res.json({
    totalUsers: Number(totalUsers),
    activeUsers: Number(activeUsers),
    totalCourses: Number(totalCourses),
    activeCourses: Number(activeCourses),
    totalTasks: totalT,
    completedTasks: completedT,
    taskCompletionRate,
    totalFiles: Number(totalFiles),
    activeAutomations: Number(activeAutomations),
    recentActivity,
    tasksByStatus: {
      todo: Number(todoTasks),
      in_progress: Number(inProgressTasks),
      completed: completedT,
    },
    coursesByStatus: {
      draft: Number(draftCourses),
      published: Number(activeCourses),
      archived: Number(archivedCourses),
    },
  });
});

export default router;
