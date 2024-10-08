import supertest from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";
import { Order } from "../../models/order.js";
import { OrderStatus } from "@metabloit.io/common";
import { stripe } from "../../stripe.js";

it("returns 404 when purchase is made for non existing order", async () => {
  const response = await supertest(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "adaas",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    });

  expect(response.status).toEqual(404);
});

it("returns 401 if user purchases an order that does not belong to them", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 20,
  });

  await order.save();

  const response = await supertest(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "adaas",
      orderId: order.id,
    });

  expect(response.status).toEqual(401);
});

it("returns 400 if cancelled order is purchased", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Cancelled,
    price: 20,
  });

  await order.save();

  const response = await supertest(app)
    .post("/api/payments")
    .set("Cookie", global.signin(order.userId))
    .send({
      token: "adaas",
      orderId: order.id,
    });

  expect(response.status).toEqual(400);
});

it("returns 201 for valid entries", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 10000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    status: OrderStatus.Created,
    price,
  });

  await order.save();

  const response = await supertest(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    });

  expect(response.status).toEqual(201);

  const stripeCharges = await stripe.charges.list({
    limit: 200,
  });

  const stripeCharge = stripeCharges.data.find(
    (charge) => charge.amount === price * 100,
  );

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual("tzs");
});
