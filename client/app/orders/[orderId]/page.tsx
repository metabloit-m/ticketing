'use client';

import { useEffect, useState } from 'react';
import buildClient from '@/lib/build-client';
import { CountdownTimer } from '@/lib/timer';
import { Button } from '@nextui-org/react';
import Link from 'next/link';

interface OrderData {
  id: string;
  userId: string;
  status: string;
  expiresAt: string;
  ticket: string;
  version: number;
}

export default function Page({ params }: { params: { orderId: string } }) {
  const [data, setData] = useState<OrderData>();
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const getData = async (orderId) => {
      const client = buildClient();
      const { data } = await client.get(`/api/orders/${orderId}`);
      return data;
    };
    getData(params.orderId).then((data) => {
      setData(data);
      setTimeLeft(
        (new Date(data.expiresAt).getTime() - new Date().getTime()) / 1000
      );
    });
  }, []);

  if (timeLeft === null) return <p>Please wait...</p>;

  return (
    <div>
      <h1>hello, {data.id}</h1>
      <CountdownTimer initialSeconds={timeLeft} />
      <Link href={`/orders/${params.orderId}/purchase`}>Pay Now</Link>
    </div>
  );
}
