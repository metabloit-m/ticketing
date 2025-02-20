import { RequireAuth } from "@metabloit.io/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { ValidateRequest } from "@metabloit.io/common";
import { Ticket } from "../models/ticket.js";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher.js";
import { natswrapper } from "../nats-wrapper.js";

const router = express.Router();

router.post(
  "/api/tickets",
  RequireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();
    await new TicketCreatedPublisher(natswrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(201).send(ticket);
  },
);

export { router as createTicketRouter };
