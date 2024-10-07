'use client';

import useRequest from '@/hooks/use-request';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();

  const { doRequest } = useRequest({
    method: 'post',
    url: '/api/users/signout',
    body: {},
    onSuccess: () => {
      router.push('/signin');
      return router.refresh();
    },
  });

  useEffect(() => {
    doRequest()
      .then((res) => {
        return console.info('OK!');
      })
      .catch((err) => {
        return;
      });

    return () => {};
  }, []);

  return <div>Signing out...</div>;
}
