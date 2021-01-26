import cookieParser from "cookie-parser";
import logger from "morgan";
import methodOverride from "method-override";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const app = express();

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "test",
      version: "1.0.0",
    },
  },
  apis: ["src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

app.use(logger("dev"));
app.use(express.json());
app.use(methodOverride());
app.use(cookieParser());

app.use("/account", require("./route"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.set("port", 3001);
app.listen(app.get("port"), function () {
  console.log("Express server listening on port 3001");
});

module.exports = {
  app,
};
