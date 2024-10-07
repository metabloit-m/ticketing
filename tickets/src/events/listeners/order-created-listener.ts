import {
  Listener,
  OrderCreatedEvent,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { AckPolicy, DeliverPolicy, JsMsg, ReplayPolicy } from "nats";
import { Ticket } from "../../models/ticket.js";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher.js";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  streamName: string = StreamNames.Orders;
  filterSubject: Subjects.OrderCreated = Subjects.OrderCreated;
  durableName: string = "order-consumer";
  ackPolicy: AckPolicy = AckPolicy.Explicit;
  deliverPolicy: DeliverPolicy = DeliverPolicy.All;
  replayPolicy: ReplayPolicy = ReplayPolicy.Instant;
  maxAckPending: number = 1;

  async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ orderId: data.id });

    await ticket.save();

    await new TicketUpdatedPublisher(this.nc).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
      userId: ticket.userId,
      orderId: ticket.orderId!,
    });

    msg.ack();
  }
}
