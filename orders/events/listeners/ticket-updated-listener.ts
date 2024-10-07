import {
  Listener,
  TicketUpdatedEvent,
  Subjects,
  StreamNames,
} from "@metabloit.io/common";
import { AckPolicy, DeliverPolicy, JsMsg, ReplayPolicy } from "nats";
import { Ticket } from "../../src/models/ticket.js";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  streamName: string = StreamNames.Tickets;
  filterSubject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  durableName: string = "ticket-updated-consumer";
  ackPolicy: AckPolicy = AckPolicy.Explicit;
  replayPolicy: ReplayPolicy = ReplayPolicy.Instant;
  maxAckPending: number = 1;
  deliverPolicy: DeliverPolicy = DeliverPolicy.All;

  async onMessage(data: TicketUpdatedEvent["data"], msg: JsMsg): Promise<void> {
    const { title, price, id, version } = data;
    const ticket = await Ticket.findByEvent({ id, version });

    if (!ticket) throw new Error("Ticket not found");

    ticket.set({ title, price });
    await ticket.save();
    msg.ack();
  }
}
