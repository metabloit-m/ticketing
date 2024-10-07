import request from "supertest";
import { app } from "../../app.js";
import mongoose, { mongo } from "mongoose";
import { natswrapper } from "../../nats-wrapper.js";
import { Ticket } from "../../models/ticket.js";

it("returns a 404 if id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "akdkjf",
      price: 20,
    });
});

it("returns a 401 if user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "dafaad",
      price: 20,
    })
    .expect(401);
});

it("returns a 401 if user does not own the ticket", async () => {
  const title = "concert";
  const price = 30;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asdfg",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(401);
});

it("returns a 400 if user provides invalid inputs", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asdfg",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 30,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "dafdf",
      price: -40,
    })
    .expect(400);
});

it("updates ticket provided valid inputs", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdfg",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "newTitle",
      price: 30,
    })
    .expect(200);

  const updatedTicket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(updatedTicket.body.title).toEqual("newTitle");
  expect(updatedTicket.body.price).toEqual(30);
});

it("publishes an event", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdfg",
      price: 20,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "newTitle",
      price: 30,
    })
    .expect(200);

  // expect(natswrapper.client.jetstream).toHaveBeenCalled();
  const js = natswrapper.client.jetstream;
  expect(js).toHaveBeenCalled();
  expect(js().publish).toHaveBeenCalled();
});

it("rejects an update on a reserved ticket", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdfg",
      price: 20,
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket?.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket?.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "newTitle",
      price: 30,
    })
    .expect(400);
});
