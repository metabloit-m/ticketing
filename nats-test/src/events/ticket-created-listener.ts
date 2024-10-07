import { JsMsg, AckPolicy, DeliverPolicy, ReplayPolicy } from "nats";
import { Listener } from "./base-listener.js";
import { TicketCreatedEvent } from "./ticket-created-event.js";
import { Subjects } from "./subjects.js";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  streamName = "TICKETS";
  durableName = "payments-service";
  ackPolicy = AckPolicy.Explicit;
  filterSubject: Subjects.TicketCreated = Subjects.TicketCreated;
  replayPolicy = ReplayPolicy.Instant;
  deliverPolicy = DeliverPolicy.All;
  maxAckPending = 1;

  async onMessage(data: TicketCreatedEvent["data"], msg: JsMsg): Promise<void> {
    console.log(`Event Data: ${JSON.stringify(data)}\n`);
    // console.log(
    //   `Sequence: ${msg.seq}, Redelivered: ${msg.redelivered}, Redelivery Count: ${msg.info.redeliveryCount}`,
    // );
    // msg.ack();
    try {
      // Process your message here

      await msg.ack();
      // console.log(`Message ${msg.seq} acknowledged successfully`);
    } catch (error) {
      console.error(`Error processing message ${msg.seq}:`, error);
      // Depending on your error handling strategy, you might want to nak() or term() the message
      // await msg.nak();
    }
  }
}
