import {
  ExpirationCompleteEvent,
  Publisher,
  StreamNames,
  Subjects,
} from "@metabloit.io/common";
import { RetentionPolicy } from "nats";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  protected streamName: string = StreamNames.Expiration;
  protected retentionPolicy: RetentionPolicy = RetentionPolicy.Interest;
}
