import mongoose, { set } from "mongoose";
import { Ticket } from "../../../models/ticket.js";
import { OrderCancelledListener } from "../order-cancelled-listener.js";
import { natswrapper } from "../../../nats-wrapper.js";
import { OrderCancelledEvent } from "@metabloit.io/common";
import { JsMsg } from "nats";
import { jest } from "@jest/globals";

const setup = async () => {
  const ticket = Ticket.build({
    price: 20,
    title: "asdf",
    userId: "123",
  });

  const orderId = new mongoose.Types.ObjectId().toHexString();

  ticket.set({ orderId: orderId });

  await ticket.save();

  const listener = new OrderCancelledListener(natswrapper.client);

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { ticket, orderId, listener, msg, data };
};

it("updates the ticket, publishes an event, and acks the event", async () => {
  const { ticket, orderId, listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket?.orderId).not.toBeDefined();
  expect(natswrapper.client.jetstream().publish).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalled();
});
