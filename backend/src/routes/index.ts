import { Router } from "express";
import { accountRouter } from "./account";
import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { leadsRouter } from "./leads";
import { mfaRouter } from "./auth-mfa";
import { portalRouter } from "./portal";

/**
 * Versionierte REST-API unter /api/v1.
 * Module werden hier eingehängt, sobald sie gebaut sind.
 */
export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({ name: "FA Transport API", version: "v1" });
});

apiRouter.use("/auth/mfa", mfaRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/account", accountRouter);
apiRouter.use("/portal", portalRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/leads", leadsRouter);
