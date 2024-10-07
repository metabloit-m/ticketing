import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher.js";
import { natswrapper } from "../nats-wrapper.js";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order.expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  console.log(
    "Publish an order expiration event for orderId: ",
    job.data.orderId,
  );
  new ExpirationCompletePublisher(natswrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
