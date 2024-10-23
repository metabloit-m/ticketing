'use server';

import { headers } from 'next/headers';

export default async function Page() {
  const currentUser = JSON.parse(headers().get('currentUser'));

  return (
    <div className={'mx-auto max-w-6xl'}>
      Landing Page here!!, welcome to the Ticketing Service,{' '}
      {currentUser?.email || 'guest'}
    </div>
  );
}
