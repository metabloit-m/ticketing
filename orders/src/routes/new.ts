import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  RequireAuth,
  ValidateRequest,
} from "@metabloit.io/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket.js";
import { Order } from "../models/order.js";
import { OrderCreatedPublisher } from "../../events/publishers/order-created-publisher.js";
import { natswrapper } from "../nats-wrapper.js";

const router = express.Router();
const EXPIRATION_INTERVAL = 5 * 60;

router.post(
  "/api/orders",
  RequireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("Ticket ID must be provided"),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) throw new NotFoundError();

    const isReserved = await ticket?.isReserved();
    if (isReserved) throw new BadRequestError("Ticket order already exists!");

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_INTERVAL);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket!,
    });

    await order.save();

    await new OrderCreatedPublisher(natswrapper.client).publish({
      id: order.id,
      userId: order.userId,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });

    return res.status(201).send(order);
  },
);

export { router as newOrderRouter };
