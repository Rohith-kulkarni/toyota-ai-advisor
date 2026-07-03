import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Toyota AI Advisor API",
    version: "1.0.0",
    description: "Backend API for Toyota dealership AI advisor MVP",
  },
};

export const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ["./src/routes/**/*.ts"],
});
