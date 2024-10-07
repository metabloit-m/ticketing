import { app } from "./app.js";
import mongoose from "mongoose";
import { natswrapper } from "./nats-wrapper.js";
import { OrderCreatedListener } from "./events/listeners/order-created-listener.js";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener.js";

const run = async () => {
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

    new OrderCreatedListener(natswrapper.client).listen();
    new OrderCancelledListener(natswrapper.client).listen();

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
