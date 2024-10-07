export default function Page({ params }: { params: { ticketId: string } }) {
  console.info(params);

  return <div>Ticket Id page details </div>;
}
