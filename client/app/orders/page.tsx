import ItemsTable from '@/components/ui/table';
import buildClient from '@/lib/build-client';
import { headers } from 'next/headers';

export default async function Page() {
  const headerList = headers();
  const client = buildClient(headerList);
  const { data } = await client.get('/api/orders');

  const columns = [
    {
      key: 'ticket.title',
      value: 'Ticket Title',
    },
    {
      key: 'ticket.price',
      value: 'Amount',
    },
    {
      key: 'status',
      value: 'Order Status',
    },
  ];

  return (
    <div className='flex items-center mx-auto w-full'>
      <ItemsTable data={data} columns={columns} />
    </div>
  );
}
