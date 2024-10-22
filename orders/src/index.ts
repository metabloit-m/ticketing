import { app } from "./app.js";
import mongoose from "mongoose";
import { natswrapper } from "./nats-wrapper.js";
import { TicketCreatedEventListener } from "../events/listeners/ticket-created-listener.js";
import { TicketUpdatedListener } from "../events/listeners/ticket-updated-listener.js";
import { ExpirationCompleteListener } from "../events/listeners/expiration-complete-listener.js";
import { PaymentCreatedListener } from "../events/listeners/payment-created-listener.js";

const run = async () => {
  console.info("Starting orders service.....");

  if (!process.env.JWT_KEY) {
    throw new Error("JWT key must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO URI must be defined");
  }

  if (!process.env.NATS_URL) {
    throw new Error("NATS URI must be defined");
  }

  try {
    const servers = {
      servers: process.env.NATS_URL,
    };
    await natswrapper.connect(servers);

    (async () => {
      for await (const s of natswrapper.client.status()) {
        console.log(`Status Received: ${s.type}`);
        if (s.type === "disconnect") {
          console.info("Draining connection...");
          await natswrapper.client.drain();
          console.info("Closing client connection...");
          process.kill(process.ppid, "SIGINT");
          process.exit(0);
        }
      }
    })().then();

    process.on("SIGTERM", () => natswrapper.client.close());
    process.on("SIGINT", () => natswrapper.client.close());

    new TicketCreatedEventListener(natswrapper.client).listen();
    new TicketUpdatedListener(natswrapper.client).listen();
    new ExpirationCompleteListener(natswrapper.client).listen();
    new PaymentCreatedListener(natswrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to tickets mongoDB");
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!");
  });
};

run();
