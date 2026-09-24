import { pino } from "pino";
import { env, isProduction } from "../config/env";

/**
 * Strukturierte Logs: JSON in Produktion (Railway durchsuchbar),
 * lesbar formatiert in der Entwicklung.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.cookie", "req.headers.authorization", "*.password", "*.passwordHash", "*.token"],
    censor: "[redacted]",
  },
  transport: isProduction ? undefined : { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } },
});
