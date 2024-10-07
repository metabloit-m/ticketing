import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket.js";
import { NotFoundError } from "@metabloit.io/common";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) throw new NotFoundError();

  return res.send(ticket);
});

export { router as showTicketRouter };
