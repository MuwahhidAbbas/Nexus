import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { hashPassword } from "./auth";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { role, search } = req.query;
  
  let users = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    role: usersTable.role,
    department: usersTable.department,
    avatarUrl: usersTable.avatarUrl,
    isActive: usersTable.isActive,
    createdAt: usersTable.createdAt,
  }).from(usersTable);

  if (role) {
    users = users.filter(u => u.role === role);
  }
  if (search) {
    const s = (search as string).toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }

  res.json(users);
});

router.post("/", async (req, res) => {
  const { email, name, password, role, department } = req.body;
  if (!email || !name || !password || !role) {
    res.status(400).json({ error: "Bad request", message: "Missing required fields" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    email, name, passwordHash, role, department
  }).returning({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    role: usersTable.role,
    department: usersTable.department,
    avatarUrl: usersTable.avatarUrl,
    isActive: usersTable.isActive,
    createdAt: usersTable.createdAt,
  });

  res.status(201).json(user);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.select({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    role: usersTable.role,
    department: usersTable.department,
    avatarUrl: usersTable.avatarUrl,
    isActive: usersTable.isActive,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  
  if (!user) {
    res.status(404).json({ error: "Not found", message: "User not found" });
    return;
  }
  res.json(user);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, role, department, isActive, avatarUrl } = req.body;

  const [user] = await db.update(usersTable).set({
    name, role, department, isActive, avatarUrl,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, id)).returning({
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    role: usersTable.role,
    department: usersTable.department,
    avatarUrl: usersTable.avatarUrl,
    isActive: usersTable.isActive,
    createdAt: usersTable.createdAt,
  });

  if (!user) {
    res.status(404).json({ error: "Not found", message: "User not found" });
    return;
  }
  res.json(user);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ success: true, message: "User deleted" });
});

export default router;
