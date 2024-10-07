import { connect, NatsConnection } from "nats";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher.js";
console.clear();

const servers = {
  servers: "http://localhost:4222",
};

async function main() {
  let nc: NatsConnection;
  try {
    nc = await connect(servers);
    console.log(`Connected to: ${nc.getServer()}`);

    const js = nc.jetstream();
    const jsm = await js.jetstreamManager();

    const publisher = new TicketCreatedPublisher(jsm, js);

    await publisher.publish({
      id: "123",
      title: "Concert",
      price: 20,
    });
  } catch (err) {
    console.error("Error occurred: ", err);
    process.exit(1);
  }
}

main().catch(console.error);
