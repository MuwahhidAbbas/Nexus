import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import coursesRouter from "./courses";
import lessonsRouter from "./lessons";
import tasksRouter from "./tasks";
import filesRouter from "./files";
import automationsRouter from "./automations";
import activityRouter from "./activity";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use("/", healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/courses", coursesRouter);
router.use("/", lessonsRouter);
router.use("/tasks", tasksRouter);
router.use("/files", filesRouter);
router.use("/automations", automationsRouter);
router.use("/activity", activityRouter);
router.use("/analytics", analyticsRouter);

export default router;
