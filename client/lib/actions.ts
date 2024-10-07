'use server';

import { headers } from 'next/headers';
import buildClient from './build-client';

export async function getOrderDetails(orderId) {
  const orderHeaders = headers();
  const client = buildClient();
  console.log(orderHeaders);
  const res = await client.get(`/api/orders/${orderId}`);

  console.log(res.data);
  return res;
}
