import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  RequireAuth,
} from "@metabloit.io/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order.js";
import { OrderCancelledPublisher } from "../../events/publishers/order-cancelled-publisher.js";
import { natswrapper } from "../nats-wrapper.js";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  RequireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("ticket");

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser?.id) throw new NotAuthorizedError();

    order.status = OrderStatus.Cancelled;

    await order.save();

    await new OrderCancelledPublisher(natswrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  },
);

export { router as deleteOrderRouter };
