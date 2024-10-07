'use server';
import buildClient from '@/lib/build-client';
import { headers } from 'next/headers';
import TicketsTable from './_components/table';

export default async function Page() {
  const headersList = headers();
  const client = buildClient(headersList);

  const { data } = await client.get('/api/tickets');

  console.log(data);

  return <TicketsTable tickets={data} />;
}
