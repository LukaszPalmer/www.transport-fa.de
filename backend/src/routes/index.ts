import { Router } from "express";

/**
 * Versionierte REST-API unter /api/v1.
 * Module werden hier eingehängt, sobald sie gebaut sind (auth, customers, documents, …).
 */
export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({ name: "FA Transport API", version: "v1" });
});
