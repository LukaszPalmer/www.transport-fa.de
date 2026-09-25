import { Router } from "express";
import { authRouter } from "./auth";
import { portalRouter } from "./portal";

/**
 * Versionierte REST-API unter /api/v1.
 * Module werden hier eingehängt, sobald sie gebaut sind.
 */
export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({ name: "FA Transport API", version: "v1" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/portal", portalRouter);
