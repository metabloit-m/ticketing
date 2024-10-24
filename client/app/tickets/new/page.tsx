'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@nextui-org/react';
import { Button } from '@/components/ui/button';
import useRequest from '@/hooks/use-request';
import { redirect, useRouter } from 'next/navigation';

const ticketSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required',
    })
    .min(2, {
      message: 'Title must at least be 2 characters',
    })
    .max(50),
  price: z.coerce
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Invalid price received',
    })
    .nonnegative()
    .finite()
    .safe(),
});

export default function Page() {
  const router = useRouter();
  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: '',
      price: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof ticketSchema>) => {
    console.log(values);
    const { doRequest } = useRequest({
      url: '/api/tickets',
      method: 'post',
      body: values,
      onSuccess: (ticket) => router.push('/tickets'),
    });

    doRequest().then((res) => console.info('success promise' + res));
  };

  return (
    <div className='mx-auto w-full '>
      <Form {...form}>
        <form className={'space-y-6'} onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder='Title' {...field} />
                </FormControl>
                <FormDescription>Title of the ticket</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    value={value.toString()}
                    onChange={(e) => onChange(Number(e.target.value))}
                    placeholder='0.00'
                    labelPlacement='outside'
                    startContent={
                      <div className='pointer-events-none flex items-center'>
                        <span className='text-default-400 text-small'>TZS</span>
                      </div>
                    }
                    endContent={
                      <div className='flex items-center'>
                        <span>/=</span>
                      </div>
                    }
                  />
                </FormControl>
                <FormDescription>Price of the ticket</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Submit</Button>
        </form>
      </Form>
    </div>
  );
}
