import mongoose from "mongoose";
import { Ticket } from "../../../src/models/ticket.js";
import { natswrapper } from "../../../src/nats-wrapper.js";
import { ExpirationCompleteListener } from "../expiration-complete-listener.js";
import { ExpirationCompleteEvent, OrderStatus } from "@metabloit.io/common";
import { Order } from "../../../src/models/order.js";
import { JsMsg } from "nats";
import { jest } from "@jest/globals";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natswrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 120,
  });

  await ticket.save();

  const order = Order.build({
    userId: "asdf",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { data, listener, msg, order, ticket };
};

it("updates order status to cancelled", async () => {
  const { data, listener, msg, order, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("emits an order cancelled event", async () => {
  const { data, listener, msg, order, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(natswrapper.client.jetstream().publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    new TextDecoder().decode(
      (natswrapper.client.jetstream().publish as jest.Mock).mock
        .calls[0][1] as AllowSharedBufferSource,
    ),
  );

  expect(eventData.id).toEqual(order.id);
});
it("acks the message", async () => {
  const { data, listener, msg, order, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
