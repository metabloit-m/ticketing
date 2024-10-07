import {
  Publisher,
  StreamNames,
  Subjects,
  TicketUpdatedEvent,
} from "@metabloit.io/common";
import { natswrapper } from "../../nats-wrapper.js";
import { RetentionPolicy } from "nats";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  streamName = StreamNames.Tickets;
  retentionPolicy = RetentionPolicy.Interest;
}
