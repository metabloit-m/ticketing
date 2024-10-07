import {
  Listener,
  StreamNames,
  Subjects,
  TicketCreatedEvent,
} from "@metabloit.io/common";
import { AckPolicy, DeliverPolicy, JsMsg, ReplayPolicy } from "nats";
import { Ticket } from "../../src/models/ticket.js";

export class TicketCreatedEventListener extends Listener<TicketCreatedEvent> {
  streamName: string = StreamNames.Tickets;
  filterSubject: Subjects.TicketCreated = Subjects.TicketCreated;
  durableName: string = "ticket-consumer";
  ackPolicy: AckPolicy = AckPolicy.Explicit;
  replayPolicy: ReplayPolicy = ReplayPolicy.Instant;
  maxAckPending: number = 1;
  deliverPolicy: DeliverPolicy = DeliverPolicy.All;

  async onMessage(data: TicketCreatedEvent["data"], msg: JsMsg): Promise<void> {
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();
    msg.ack();
  }
}
