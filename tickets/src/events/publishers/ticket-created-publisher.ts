import {
  Subjects,
  TicketCreatedEvent,
  Publisher,
  StreamNames,
} from "@metabloit.io/common";
import { RetentionPolicy } from "nats";
import { natswrapper } from "../../nats-wrapper.js";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  streamName: string = StreamNames.Tickets;
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  retentionPolicy: RetentionPolicy = RetentionPolicy.Interest;
}
