import React from 'react';

export default function CreateTicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='mx-auto w-full flex m-3 p-4'>{children}</div>;
}
