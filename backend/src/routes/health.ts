import { Router } from "express";
import { isDatabaseReady } from "../db/connection";

/**
 * GET /health        Liveness – Prozess läuft.
 * GET /health/ready  Readiness – Datenbank erreichbar (Railway-Healthcheck beim Deploy).
 */
export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
});

healthRouter.get("/ready", (_req, res) => {
  const database = isDatabaseReady();
  res.status(database ? 200 : 503).json({ status: database ? "ready" : "unavailable", database });
});
