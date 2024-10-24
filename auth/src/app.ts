import express from "express";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
import "express-async-errors";
import mongoose from "mongoose";
import cors from "cors";
import { currentUserRouter } from "./routes/current-user.js";
import { signinRouter } from "./routes/signin.js";
import { signupRouter } from "./routes/signup.js";
import { signoutRouter } from "./routes/signout.js";
import { errorHandler } from "@metabloit.io/common";
import { NotFoundError } from "@metabloit.io/common";

const app = express();
app.set("trust proxy", true);
app.use(
  cors({
    origin: "https://metabloit.xyz",
  }),
);
app.use(bodyParser.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  }),
);

console.log("Before user router...");

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
