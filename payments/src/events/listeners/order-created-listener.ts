import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { AckPolicy, DeliverPolicy, JsMsg, ReplayPolicy } from "nats";
import { Order } from "../../models/order.js";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  streamName: string = StreamNames.Orders;
  filterSubject: Subjects.OrderCreated = Subjects.OrderCreated;
  durableName: string = "payments-consumer";
  ackPolicy: AckPolicy = AckPolicy.Explicit;
  replayPolicy: ReplayPolicy = ReplayPolicy.Instant;
  maxAckPending: number = 1;
  deliverPolicy: DeliverPolicy = DeliverPolicy.All;

  async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg) {
    const order = Order.build({
      id: data.id,
      version: data.version,
      status: OrderStatus.Created,
      userId: data.userId,
      price: data.ticket.price,
    });

    await order.save();

    msg.ack();
  }
}
