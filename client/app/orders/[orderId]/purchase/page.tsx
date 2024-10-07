'use client';

import React from 'react';
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import CheckoutForm from '../_components/CheckOutForm';
import CompletePage from '../_components/CompletePage';

const stripePromise = loadStripe(
  'pk_test_51MuLp9FaXKnnAEBNKe8LpxHQ8CSrWXTrSeF9JOyQVphdZdWfwn3xANYhqoPPMRnj9HNykQ4PpRXMIpaS2MNV46dI00i6Xy2WON'
);

export default function PaymentForm({
  params,
}: {
  params: { orderId: string };
}) {
  // console.log(params);
  const [clientSecret, setClientSecret] = React.useState('');
  const [dpmCheckerLink, setDpmCheckerLink] = React.useState('');
  const [confirmed, setConfirmed] = React.useState('');

  React.useEffect(() => {
    setConfirmed(
      new URLSearchParams(window.location.search).get(
        'payment_intent_client_secret'
      )
    );
  });

  React.useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: params.orderId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        // [DEV] For demo purposes only
        setDpmCheckerLink(data.dpmCheckerLink);
      });
  }, []);

  const appearance: Appearance = {
    theme: 'stripe',
  };
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div className='App'>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          {confirmed ? (
            <CompletePage />
          ) : (
            <CheckoutForm
              dpmCheckerLink={dpmCheckerLink}
              orderId={params.orderId}
            />
          )}
        </Elements>
      )}
    </div>
  );
}
