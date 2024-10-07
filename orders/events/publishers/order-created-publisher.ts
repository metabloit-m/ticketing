import {
  OrderCreatedEvent,
  Publisher,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { RetentionPolicy } from "nats";
import { natswrapper } from "../../src/nats-wrapper.js";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  protected streamName: string = StreamNames.Orders;
  protected retentionPolicy: RetentionPolicy = RetentionPolicy.Interest;
}
