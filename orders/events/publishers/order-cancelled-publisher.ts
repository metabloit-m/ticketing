import {
  OrderCancelledEvent,
  Publisher,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { natswrapper } from "../../src/nats-wrapper.js";
import { RetentionPolicy } from "nats";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  protected streamName: string = StreamNames.Orders;
  protected retentionPolicy: RetentionPolicy = RetentionPolicy.Interest;
}
