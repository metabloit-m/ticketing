import express from "express";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
import "express-async-errors";

import { currentUser } from "@metabloit.io/common";
import { errorHandler } from "@metabloit.io/common";
import { NotFoundError } from "@metabloit.io/common";
import { createChargeRouter } from "./routes/new.js";

const app = express();
app.set("trust proxy", true);
app.use(bodyParser.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  }),
);

app.use(currentUser);

app.use(createChargeRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
