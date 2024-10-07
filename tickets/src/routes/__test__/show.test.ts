import request from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";

it("returns 404 if ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns a ticket if ticket is found", async () => {
  const title = "Concert";
  const price = 20;

  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticket.body.title).toEqual(title);
  expect(ticket.body.price).toEqual(price);
});
