import { Router, type IRouter } from "express";
import { db, activityLogsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const userId = req.query.userId ? parseInt(req.query.userId as string) : null;

  let logs = await db.select().from(activityLogsTable).orderBy(desc(activityLogsTable.createdAt)).limit(limit);
  if (userId) logs = logs.filter(l => l.userId === userId);

  const result = await Promise.all(logs.map(async (log) => {
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

  res.json(result);
});

export default router;
