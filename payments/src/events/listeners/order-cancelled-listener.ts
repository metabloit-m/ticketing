import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { AckPolicy, DeliverPolicy, JsMsg, ReplayPolicy } from "nats";
import { Order } from "../../models/order.js";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  streamName: string = StreamNames.Orders;
  filterSubject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  durableName: string = "payment-order-cancelled";
  ackPolicy: AckPolicy = AckPolicy.Explicit;
  deliverPolicy: DeliverPolicy = DeliverPolicy.All;
  replayPolicy: ReplayPolicy = ReplayPolicy.Instant;
  maxAckPending: number = 1;

  async onMessage(data: OrderCancelledEvent["data"], msg: JsMsg) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error("Order to be cancelled not found");
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    msg.ack();
  }
}
