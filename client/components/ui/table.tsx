'use client';

import { useAsyncList } from '@react-stately/data';
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
} from '@nextui-org/react';
import { NumericFormat } from 'react-number-format';

export default function ItemsTable({ data, columns }) {
  const [isLoading, setIsLoading] = React.useState(true);

  let list = useAsyncList({
    async load() {
      setIsLoading(false);
      return {
        items: data,
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
      case 'ticket.title':
        return <div>{item.ticket.title}</div>;

      case 'ticket.price':
        return (
          <NumericFormat
            className={'outline-none'}
            value={item.ticket.price}
            thousandSeparator={','}
            decimalScale={2}
            fixedDecimalScale
            prefix='TZS '
            displayType='text'
            style={{ backgroundColor: 'transparent' }}
          />
        );

      default:
        return <>{getKeyValue(item, columnKey)}</>;
    }
  }, []);

  return (
    <Table
      aria-label='Example table with client side sorting'
      sortDescriptor={list.sortDescriptor}
      onSortChange={list.sort}
    >
      <TableHeader>
        {columns &&
          columns.map((item) => {
            return <TableColumn key={item.key}>{item.value}</TableColumn>;
          })}
      </TableHeader>
      <TableBody
        items={list.items}
        isLoading={isLoading}
        loadingContent={<Spinner label='Loading...' />}
        emptyContent={'No rows to display.'}
      >
        {(item: { id: string }) => (
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
