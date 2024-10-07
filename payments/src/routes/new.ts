import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  RequireAuth,
  ValidateRequest,
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
  OrderStatus,
} from "@metabloit.io/common";
import { Order } from "../models/order.js";
import { stripe } from "../stripe.js";
import { Payment } from "../models/payment.js";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher.js";
import { natswrapper } from "../nats-wrapper.js";

const router = express.Router();

router.post(
  "/api/payments",
  RequireAuth,
  [body("orderId").not().isEmpty()],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot create payment for a cancelled order");
    }

    // const charge = await stripe.charges.create({
    //   amount: order.price * 100,
    //   currency: "tzs",
    //   source: token,
    //   description: `Payment successfully completed`,
    // });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price * 100,
      currency: "tzs",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration_check: "accept_payment",
      },
      receipt_email: req.currentUser.email,
    });

    const payment = Payment.build({
      stripeId: paymentIntent.id,
      orderId: order.id,
    });

    await payment.save();

    // order.status = OrderStatus.AwaitingPayment;
    //
    // await order.save();

    await new PaymentCreatedPublisher(natswrapper.client).publish({
      id: payment.id,
      stripeId: payment.stripeId,
      orderId: payment.orderId,
    });

    res.status(201).send({
      id: payment.id,
      clientSecret: paymentIntent.client_secret,
    });
  },
);

export { router as createChargeRouter };
