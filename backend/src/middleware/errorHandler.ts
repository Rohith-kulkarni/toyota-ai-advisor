import type { ErrorRequestHandler } from "express";

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

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
};
