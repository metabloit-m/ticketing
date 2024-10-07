'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import useRequest from '@/hooks/use-request';

export default function Page() {
  const [err, setErr] = useState('');

  const router = useRouter();

  const formSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(6, {
        message: 'Password should at least be 6 characters',
      })
      .trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const { doRequest } = useRequest({
      url: '/api/users/signup',
      method: 'post',
      body: values,
      onSuccess: () => {
        router.push('/');
        return router.refresh();
      },
    });

    doRequest()
      .then((res) => {
        console.log('OK');
      })
      .catch((err) => {
        setErr(err.response.data.errors);
      });
  }

  return (
    <div>
      <h1 className='mb-6 scroll-m-20 mb-6text-4xl font-extrabold tracking-tight lg:text-5xl'>
        Sign Up
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={'space-y-8'}>
          <FormField
            control={form.control}
            name={'email'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={'Email'}
                    autoComplete={'email'}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Input email here</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={'password'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type={'password'}
                    placeholder={'Password'}
                    autoComplete={'current-password'}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Input password here</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type={'submit'}>Sign Up</Button>
          {err?.length > 0 ? (
            <div>
              <ul>
                {err.map((error) => (
                  <li className={'text-red-500'} key={error.message}>
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            ''
          )}
        </form>
      </Form>
    </div>
  );
}
