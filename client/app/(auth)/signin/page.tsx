'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useRequest from '@/hooks/use-request';
import { useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Page() {
  const router = useRouter();
  const [error, setError] = useState([]);

  const formSchema = z
    .object({
      email: z
        .string()
        .min(1, {
          message: 'Email is required',
        })
        .email({
          message: 'Provide a valid email',
        }),
      password: z
        .string()
        .min(1, {
          message: 'Password is required',
        })
        .trim(),
    })
    .required();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { doRequest } = useRequest({
      url: '/api/users/signin',
      method: 'post',
      body: values,
      onSuccess: () => {
        router.push('/');
        return router.refresh();
      },
    });

    doRequest()
      .then((res) => {
        return console.log('ok');
      })
      .catch((err) => {
        return setError(err.response.data.errors);
      });
  }

  return (
    <div>
      <h1 className='mb-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
        Log In
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={'space-y-8'}>
          <FormField
            name={'email'}
            control={form.control}
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
            name={'password'}
            control={form.control}
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

          <Button type={'submit'}>Log In</Button>

          {error?.length > 0 ? (
            <div>
              <ul>
                {error.map((error) => (
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
