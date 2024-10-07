import express from "express";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
import "express-async-errors";

import { createTicketRouter } from "./routes/new.js";
import { currentUser } from "@metabloit.io/common";

import { errorHandler } from "@metabloit.io/common";
import { NotFoundError } from "@metabloit.io/common";
import { showTicketRouter } from "./routes/show.js";
import { indexTicketRouter } from "./routes/index.js";
import { updateTicketRouter } from "./routes/update.js";

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
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
