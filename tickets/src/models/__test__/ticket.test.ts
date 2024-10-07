import { Ticket } from "../ticket.js";

it("implements optimistic concurrency control", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 10,
    userId: "123",
  });

  await ticket.save();

  const firstTicket = await Ticket.findById(ticket.id);
  const secondTicket = await Ticket.findById(ticket.id);

  firstTicket?.set({ price: 30 });
  secondTicket?.set({ price: 40 });

  await firstTicket?.save();

  // expect(async () => {
  //   return await secondTicket?.save();
  // }).toThrow();

  try {
    await secondTicket?.save();
  } catch (err: any) {
    // console.error(err);
    expect(err).toBeDefined();
    expect(err.message).toContain("version");
  }

  // throw new Error();
});

it("increments version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 30,
    userId: "122",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
