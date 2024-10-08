import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app.js";
import { Ticket } from "../../models/ticket.js";
import { Order, OrderStatus } from "../../models/order.js";
import { natswrapper } from "../../nats-wrapper.js";

it("returns an error if ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticketId })
    .expect(404);
});

it("returns an error if ticket is already reserved", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 30,
  });

  await ticket.save();

  const order = Order.build({
    userId: "test",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 30,
  });

  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits order created event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 30,
  });

  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const js = natswrapper.client.jetstream;
  expect(js).toHaveBeenCalled();
  expect(js().publish).toHaveBeenCalled();
});
