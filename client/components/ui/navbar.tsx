'use client';

import Link from 'next/link';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from '@nextui-org/react';
import { usePathname } from 'next/navigation';

type NavBarProps = {
  currentUser: {
    id: string;
    email: string;
    iat: number;
  };
};

type Link = {
  label: string;
  href: string;
  color: 'danger' | 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  variant:
    | 'flat'
    | 'bordered'
    | 'light'
    | 'solid'
    | 'faded'
    | 'shadow'
    | 'ghost';
  radius: 'sm' | 'none' | 'md' | 'lg' | 'full';
};

export function NavBar({ currentUser }: NavBarProps) {
  const pathname = usePathname();

  let links: Link[] = [
    !currentUser && {
      label: 'Login',
      href: '/signin',
      color: 'danger',
      variant: 'bordered',
      radius: 'sm',
    },
    !currentUser && {
      label: 'Sign Up',
      href: '/signup',
      color: 'danger',
      variant: 'light',
      radius: 'sm',
    },
  ].filter(Boolean) as Link[];

  links = links;
  return (
    <Navbar isBordered>
      <NavbarBrand>
        <Link href='/'>ticketing</Link>
      </NavbarBrand>
      {!currentUser ? (
        <NavbarContent justify='end'>
          {links.map((link) => {
            return (
              <NavbarItem key={link.label}>
                <Button
                  as={Link}
                  href={link.href}
                  className={`${pathname === link.href ? 'hidden' : ''}`}
                  color={link.color!}
                  variant={link.variant!}
                  radius={link.radius!}
                >
                  {link.label}
                </Button>
              </NavbarItem>
            );
          })}
        </NavbarContent>
      ) : (
        <NavbarContent
          as={'div'}
          className={'items-center space-x-4'}
          justify='end'
        >
          <Link
            href={'/tickets'}
            className={`${pathname === '/tickets' ? 'hidden' : ''} hover:text-pink-700`}
          >
            View Tickets
          </Link>
          <Dropdown placement='bottom-end'>
            <DropdownTrigger>
              <Avatar
                isBordered
                showFallback
                as={'button'}
                className={'transition-transform'}
                color='secondary'
                size='sm'
                src='https://images.unsplash.com/broken'
              />
            </DropdownTrigger>
            <DropdownMenu aria-label='Profile Actions' variant='flat'>
              <DropdownSection showDivider>
                <DropdownItem key={'profile'} className={'h-14 gap-2'}>
                  <p className='font-semibold'>Signed In as</p>
                  <p className='font-semibold'>{currentUser?.email}</p>
                </DropdownItem>

                <DropdownItem
                  as={Link}
                  href={'/tickets/new'}
                  key={'new_ticket'}
                >
                  Sell Tickets
                </DropdownItem>

                <DropdownItem as={Link} href={'/orders'} key={'orders'}>
                  My Orders
                </DropdownItem>
              </DropdownSection>

              <DropdownSection>
                <DropdownItem
                  as={Link}
                  href={'/signout'}
                  key={'logout'}
                  color='danger'
                >
                  Log out
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      )}
    </Navbar>
  );
}
