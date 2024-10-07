import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={'mx-auto w-full max-w-lg items-center space-y-8 p-8'}>
      {children}
    </div>
  );
}
