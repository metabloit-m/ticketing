import { OrderCreatedListener } from "./events/listeners/order-created-listener.js";
import { natswrapper } from "./nats-wrapper.js";

const run = async () => {
  console.info("Starting ....");

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
  } catch (error) {
    console.error(error);
  }
};

run();
