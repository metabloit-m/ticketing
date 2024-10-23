import { natswrapper } from "./nats-wrapper.js";

async function main() {
  console.info("Starting nats-initializer...:)");
  if (!process.env.NATS_URL) {
    throw new Error("NATS URI must be defined");
  }

  const servers = {
    servers: process.env.NATS_URL,
  };
  await natswrapper.connect(servers);

  await natswrapper.addStream("ORDERS", ["order.>"]);
  await natswrapper.addStream("TICKETS", ["ticket.>"]);
  await natswrapper.addStream("EXPIRATION", ["expiration.>"]);
  await natswrapper.addStream("PAYMENTS", ["payment.>"]);
}

main().catch((err) => {
  console.error(err);
});
