'use client';

import { useEffect, useState } from 'react';

export const CountdownTimer = ({ initialSeconds }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevSeconds - 1;
      });

      return () => clearInterval(interval);
    }, 1000);
  }, [initialSeconds]);

  if (seconds <= 0) return <p>Your order has expired!</p>;

  return (
    <div>
      <p>You have {seconds} seconds left</p>
    </div>
  );
};
