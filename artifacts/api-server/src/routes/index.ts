import { Router, type IRouter } from "express";
import healthRouter from "./health";
import beersRouter from "./beers";
import settingsRouter from "./settings";
import authRouter from "./auth";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(beersRouter);
router.use(settingsRouter);
router.use(authRouter);
router.use(uploadRouter);

export default router;
