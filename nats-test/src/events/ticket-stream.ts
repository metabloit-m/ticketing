import { StreamNames } from "./streams.js";

export interface TicketStream {
  name: StreamNames.Tickets;
  subjects: ["ticket.>"];
}
