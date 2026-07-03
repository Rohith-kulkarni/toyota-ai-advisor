import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { healthRouter } from "./routes/health.routes";
import { dbHealthRouter } from "./routes/health.db.routes";
import { authRouter } from "./routes/auth.routes";
import { knowledgeRouter } from "./routes/knowledge.routes";
import { chatRoutes } from "./routes/chat.routes";
import { leadRoutes } from "./routes/lead.routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.use("/api", healthRouter);
app.use("/api", dbHealthRouter);
app.use("/api/auth", authRouter);
app.use("/api/knowledge", knowledgeRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/leads", leadRoutes);
app.get("/api/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

export default app;
