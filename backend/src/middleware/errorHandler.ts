import type { ErrorRequestHandler } from "express";
import { env } from "../config/env";

type AppError = Error & {
  statusCode?: number;
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const appError = err as AppError;
  const statusCode =
    typeof appError.statusCode === "number" && appError.statusCode >= 400
      ? appError.statusCode
      : res.statusCode >= 400
        ? res.statusCode
        : 500;

  if (env.nodeEnv === "development") {
    console.error("[error]", err);
  } else {
    console.error("[error]", err instanceof Error ? err.message : err);
  }

  res.status(statusCode).json({
    message:
      env.nodeEnv === "production" && statusCode >= 500
        ? "Internal Server Error"
        : err instanceof Error && err.message
          ? err.message
          : "Internal Server Error",
  });
};
