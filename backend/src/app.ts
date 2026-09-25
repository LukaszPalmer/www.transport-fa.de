import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { authenticate } from "./auth/middleware";
import { allowedOrigins } from "./config/env";
import { errorHandler, notFoundHandler } from "./http/error-handler";
import { originCheck } from "./http/origin-check";
import { requestLogger } from "./http/request-logger";
import { apiRouter } from "./routes";
import { healthRouter } from "./routes/health";

/** Express-App ohne Netzwerk-Bindung – so auch in Tests (supertest) nutzbar. */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1); // hinter dem Railway-Proxy: korrekte req.ip und req.secure

  app.use(requestLogger);
  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins, // nur das eigene Frontend – mit Cookies
      credentials: true,
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use("/health", healthRouter);
  app.use("/api/v1", originCheck, authenticate, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
