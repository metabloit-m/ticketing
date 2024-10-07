//import "./components/ui/globals.css";
import '@/styles/globals.css';
import { Inter as FontSans } from 'next/font/google';

import { cn } from '@/lib/utils';
import { Providers } from './providers';
import { NavBar } from '@/components/ui/navbar';
import { headers } from 'next/headers';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = JSON.parse(headers().get('currentuser'));

  return (
    <html lang='en' className='dark'>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers>
          <NavBar currentUser={currentUser} />
          <div
            className={
              'flex mt-4 space-y-4 mx-auto items-center max-w-[1024px]'
            }
          >
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
