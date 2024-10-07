import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket.js";
import {
  NotFoundError,
  NotAuthorizedError,
  RequireAuth,
  ValidateRequest,
  BadRequestError,
} from "@metabloit.io/common";
import { body } from "express-validator";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher.js";
import { natswrapper } from "../nats-wrapper.js";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  RequireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price is required and must greater than zero"),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) throw new NotFoundError();

    if (ticket.orderId)
      throw new BadRequestError("Cannot edit an already reserved ticket!");

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();
    await new TicketUpdatedPublisher(natswrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  },
);

export { router as updateTicketRouter };
