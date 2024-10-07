import {
  Listener,
  NotFoundError,
  OrderStatus,
  PaymentCreatedEvent,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { AckPolicy, DeliverPolicy, JsMsg, ReplayPolicy } from "nats";
import { Order } from "../../src/models/order.js";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  streamName: string = StreamNames.Payment;
  filterSubject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  durableName: string = "payment-consumer";
  ackPolicy: AckPolicy = AckPolicy.Explicit;
  deliverPolicy: DeliverPolicy = DeliverPolicy.All;
  replayPolicy: ReplayPolicy = ReplayPolicy.Instant;
  maxAckPending: number = 1;

  async onMessage(data: PaymentCreatedEvent["data"], msg: JsMsg) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found!");
    }
    order?.set({
      status: OrderStatus.Completed,
    });

    await order?.save();

    msg.ack();
  }
}
