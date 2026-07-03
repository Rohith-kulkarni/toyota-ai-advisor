import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(
    `toyota-ai-advisor-backend is running on port ${env.port} in ${env.nodeEnv} mode`
  );
});
