import { Listener, OrderCreatedEvent, Subjects } from "@metabloit.io/common";
import { AckPolicy, DeliverPolicy, ReplayPolicy } from "nats";
import { JsMsg } from "nats/lib/jetstream/jsmsg.js";
import { expirationQueue } from "../../queues/expiration-queue.js";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  streamName: string = "ORDERS";
  filterSubject: Subjects.OrderCreated = Subjects.OrderCreated;
  durableName: string = "expiration-consumer";
  ackPolicy: AckPolicy = AckPolicy.Explicit;
  deliverPolicy: DeliverPolicy = DeliverPolicy.All;
  replayPolicy: ReplayPolicy = ReplayPolicy.Instant;
  maxAckPending: number = 1;

  async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    console.log(`Ticket is locked for ${delay} milliseconds`);
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: 30000,
      },
    );

    msg.ack();
  }
}
