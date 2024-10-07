import { OrderCreatedListener } from "../order-created-listener.js";
import { natswrapper } from "../../../nats-wrapper.js";
import { Ticket } from "../../../models/ticket.js";
import { OrderCreatedEvent, OrderStatus } from "@metabloit.io/common";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { jest } from "@jest/globals";

const setup = async () => {
  const listener = new OrderCreatedListener(natswrapper.client);

  const ticket = Ticket.build({
    userId: "asfff",
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: "asdf",
    userId: "adfd",
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets the order id of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes an event", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natswrapper.client.jetstream().publish).toHaveBeenCalled();

  const updatedTicket = JSON.parse(
    new TextDecoder().decode(
      (natswrapper.client.jetstream().publish as jest.Mock).mock
        .calls[0][1] as AllowSharedBufferSource,
    ),
  );

  expect(data.id).toEqual(updatedTicket.orderId);
});
