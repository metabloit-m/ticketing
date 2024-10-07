import { RequireAuth } from "@metabloit.io/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order.js";

const router = express.Router();

router.get("/api/orders", RequireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser?.id,
  }).populate("ticket");

  res.send(orders);
});

export { router as indexOrderRouter };
