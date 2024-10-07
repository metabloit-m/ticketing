import { OrderCreatedEvent, OrderStatus } from "@metabloit.io/common";
import { natswrapper } from "../../../nats-wrapper.js";
import { OrderCreatedListener } from "../order-created-listener.js";
import mongoose from "mongoose";
import { Order } from "../../../models/order.js";
import { JsMsg } from "nats";
import { jest } from "@jest/globals";

const setup = async () => {
  const listener = new OrderCreatedListener(natswrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: "dfkja",
    userId: "dfadf",
    version: 0,
    ticket: {
      id: "kdajf",
      price: 203,
    },
  };

  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order?.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
