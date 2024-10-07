import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { AckPolicy, DeliverPolicy, JsMsg, ReplayPolicy } from "nats";
import { Order } from "../../src/models/order.js";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher.js";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  streamName: string = StreamNames.Expiration;
  filterSubject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  durableName: string = "expiration-consumer";
  ackPolicy: AckPolicy = AckPolicy.Explicit;
  replayPolicy: ReplayPolicy = ReplayPolicy.Instant;
  maxAckPending: number = 1;
  deliverPolicy: DeliverPolicy = DeliverPolicy.All;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: JsMsg) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === OrderStatus.Completed) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    await new OrderCancelledPublisher(this.nc).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
