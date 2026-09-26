import type { ApiErrorBody } from "@fa/shared";
import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { AppError, emailTakenError } from "./errors";

/**
 * Zentrale Fehlerbehandlung ("globale Error-Middleware").
 * Express 5 leitet auch Fehler aus async-Handlern automatisch hierher.
 * Interne Details (Stacktraces, DB-Meldungen) verlassen nie den Server.
 */

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(AppError.notFound("Dieser Endpunkt existiert nicht."));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  const appError = toAppError(error);

  if (appError.status >= 500) {
    req.log.error({ err: error }, "Unerwarteter Fehler");
  } else {
    req.log.warn({ code: appError.code, status: appError.status }, appError.message);
  }

  const body: ApiErrorBody = {
    error: {
      code: appError.code,
      message: appError.message,
      fields: appError.fields,
      requestId: String(req.id),
    },
  };
  res.status(appError.status).json(body);
};

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof z.ZodError) {
    return AppError.validation(
      Object.fromEntries(error.issues.map((issue) => [issue.path.join(".") || "_", issue.message])),
    );
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return AppError.validation(
      Object.fromEntries(Object.entries(error.errors).map(([path, detail]) => [path, detail.message])),
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return AppError.badRequest(`Ungültiger Wert für "${error.path}".`);
  }

  if (isDuplicateKeyError(error)) {
    // Parallele Registrierung/Änderung mit derselben Adresse – der Unique-Index gewinnt.
    return "email" in (error.keyPattern ?? {}) ? emailTakenError() : AppError.conflict();
  }

  // Fehler des JSON-Body-Parsers (express.json)
  if (isBodyParserError(error)) {
    return error.type === "entity.too.large"
      ? new AppError(413, "PAYLOAD_TOO_LARGE", "Die Anfrage ist zu groß.")
      : AppError.badRequest("Der Anfrageinhalt ist kein gültiges JSON.");
  }

  return new AppError(500, "INTERNAL", "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
}

function isDuplicateKeyError(error: unknown): error is mongoose.mongo.MongoServerError {
  return error instanceof mongoose.mongo.MongoServerError && error.code === 11000;
}

function isBodyParserError(error: unknown): error is { type: string } {
  return typeof error === "object" && error !== null && "type" in error && typeof error.type === "string" && "status" in error;
}
