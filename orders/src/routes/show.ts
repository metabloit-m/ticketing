import {
  NotAuthorizedError,
  NotFoundError,
  RequireAuth,
} from "@metabloit.io/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order.js";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  RequireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId);

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser?.id) throw new NotAuthorizedError();

    res.send(order);
  },
);

export { router as showOrderRouter };
