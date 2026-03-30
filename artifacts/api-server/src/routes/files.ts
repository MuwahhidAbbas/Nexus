import { Router, type IRouter } from "express";
import { db, filesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getFileWithUser(fileId: number) {
  const [file] = await db.select().from(filesTable).where(eq(filesTable.id, fileId)).limit(1);
  if (!file) return null;

  const [user] = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email,
    role: usersTable.role, department: usersTable.department,
    avatarUrl: usersTable.avatarUrl, isActive: usersTable.isActive, createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, file.uploadedById)).limit(1);

  return { ...file, uploadedBy: user ?? null };
}

router.get("/", async (req, res) => {
  const { folder, userId } = req.query;
  
  let files = await db.select().from(filesTable);
  if (folder) files = files.filter(f => f.folder === folder);
  if (userId) files = files.filter(f => f.uploadedById === parseInt(userId as string));

  const result = await Promise.all(files.map(f => getFileWithUser(f.id)));
  res.json(result.filter(Boolean));
});

router.post("/", async (req, res) => {
  const { name, originalName, mimeType, size, folder, url, uploadedById, isPublic } = req.body;
  if (!name || !originalName || !mimeType || !size || !url || !uploadedById) {
    res.status(400).json({ error: "Bad request", message: "Missing required fields" });
    return;
  }

  const [file] = await db.insert(filesTable).values({
    name, originalName, mimeType, size, folder, url, uploadedById, isPublic: isPublic ?? false
  }).returning();

  const result = await getFileWithUser(file.id);
  res.status(201).json(result);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const file = await getFileWithUser(id);
  if (!file) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(file);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(filesTable).where(eq(filesTable.id, id));
  res.json({ success: true, message: "File deleted" });
});

export default router;
