import {
  PaymentCreatedEvent,
  Publisher,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { RetentionPolicy } from "nats";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  protected streamName: string = StreamNames.Payment;
  protected retentionPolicy: RetentionPolicy = RetentionPolicy.Interest;
}
