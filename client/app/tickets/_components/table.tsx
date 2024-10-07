'use client';

import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
  Tooltip,
} from '@nextui-org/react';
import { useAsyncList } from '@react-stately/data';
import { NumericFormat } from 'react-number-format';
import { EditIcon } from './edit-icon';
import { EyeIcon } from './eye-icon';
import Link from 'next/link';
import ViewItem from '@/components/ui/modal';
import useRequest from '@/hooks/use-request';
import { useRouter } from 'next/navigation';

export default function TicketsTable({ tickets }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  // console.log({ ...tickets.tickets });

  const orderRequest = (ticketId) => {
    const { doRequest } = useRequest({
      url: '/api/orders',
      method: 'post',
      body: {
        ticketId,
      },
      onSuccess: (data) => router.push(`/orders/${data.id}`),
    });

    return doRequest;
  };
  let list = useAsyncList({
    async load({ signal }) {
      // let res = await fetch('https://swapi.py4e.com/api/people/?search', {
      //   signal,
      // });
      // let json = await res.json();
      setIsLoading(false);

      return {
        items: tickets,
      };
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          let first = a[sortDescriptor.column];
          let second = b[sortDescriptor.column];
          let cmp =
            (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

          if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
          }

          return cmp;
        }),
      };
    },
  });

  const renderCell = React.useCallback((item, columnKey) => {
    switch (columnKey) {
      case 'price':
        return (
          <NumericFormat
            className={'outline-none'}
            value={getKeyValue(item, columnKey)}
            thousandSeparator={','}
            decimalScale={2}
            fixedDecimalScale
            prefix='TZS '
            displayType='text'
            style={{ backgroundColor: 'transparent' }}
          />
        );

      case 'actions':
        return (
          <div className={'relative flex items-center gap-4'}>
            <Tooltip content='View Ticket' delay={0} closeDelay={0}>
              <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                <ViewItem
                  link={`/tickets/${item.id}`}
                  title={item.title}
                  action={'Purchase'}
                  icon={EyeIcon}
                  cb={orderRequest(item.id)}
                >
                  <p>Content Here...</p>
                </ViewItem>
              </span>
            </Tooltip>

            <Tooltip content='Edit Ticket'>
              <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                <Link href={`/tickets/${item.id}`}>
                  <EditIcon />
                </Link>
              </span>
            </Tooltip>
          </div>
        );
      default:
        return <>{getKeyValue(item, columnKey)}</>;
    }
  }, []);

  return (
    <Table
      aria-label='Tickets data'
      sortDescriptor={list.sortDescriptor}
      onSortChange={list.sort}
    >
      <TableHeader>
        <TableColumn key='id'>ID</TableColumn>
        <TableColumn key='title' allowsSorting>
          Title
        </TableColumn>
        <TableColumn key='price' allowsSorting>
          Price
        </TableColumn>
        <TableColumn key='actions'>Actions</TableColumn>
      </TableHeader>

      <TableBody
        items={list.items}
        isLoading={isLoading}
        loadingContent={<Spinner label='Loading...' />}
        emptyContent={'No rows to display.'}
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
