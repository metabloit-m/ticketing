import { connect, NatsConnection } from "nats";
import { TicketCreatedListener } from "./events/ticket-created-listener.js";
console.clear();

const servers = {
  servers: "http://localhost:4222",
};

async function main() {
  let nc: NatsConnection;
  try {
    nc = await connect(servers);
    console.log(`Connected to Listener: ${nc.getServer()}`);

    // const js = nc.jetstream();
    // const jsm = await js.jetstreamManager();

    await new TicketCreatedListener(nc).listen();
  } catch (err) {
    console.error("Error occurred: ", err);
    process.exit(1);
  }
}

main().catch(console.error);
