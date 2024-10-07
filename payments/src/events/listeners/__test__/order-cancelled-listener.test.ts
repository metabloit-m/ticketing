import { OrderCancelledEvent, OrderStatus } from "@metabloit.io/common";
import { natswrapper } from "../../../nats-wrapper.js";
import mongoose from "mongoose";
import { Order } from "../../../models/order.js";
import { JsMsg } from "nats";
import { OrderCancelledListener } from "../order-cancelled-listener.js";
import { jest } from "@jest/globals";

const setup = async () => {
  const listener = new OrderCancelledListener(natswrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "asdf",
    price: 20,
  });

  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "kdajf",
    },
  };

  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("updates order status", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
