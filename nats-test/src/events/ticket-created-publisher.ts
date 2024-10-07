import { RetentionPolicy } from "nats";
import { Publisher } from "./base-publisher.js";
import { Subjects } from "./subjects.js";
import { TicketCreatedEvent } from "./ticket-created-event.js";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  streamName: string = "TICKETS";
  retentionPolicy: RetentionPolicy = RetentionPolicy.Interest;
}
