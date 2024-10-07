import {
  JetStreamManager,
  JetStreamClient,
  ConsumerConfig,
  AckPolicy,
  ReplayPolicy,
  DeliverPolicy,
  JsMsg,
  NatsConnection,
  // NatsConnection,
} from "nats";
import { Subjects } from "./subjects.js";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  private nc: NatsConnection;
  private manager?: JetStreamManager;
  private client?: JetStreamClient;
  // private shouldShutdown = false;
  protected ackWait = 5 * 1_000_000_000; // time is nanoseconds
  abstract streamName: string;
  abstract filterSubject: T["subject"];
  abstract durableName: string;
  abstract ackPolicy: AckPolicy;
  abstract deliverPolicy: DeliverPolicy;
  abstract replayPolicy: ReplayPolicy;
  abstract maxAckPending: number;
  abstract onMessage(data: T["data"], msg: JsMsg): Promise<void>;

  constructor(nc: NatsConnection) {
    this.nc = nc;
    // this.manager = manager;
    // this.client = client;
    // process.on("SIGINT", this.gracefulShutdown);
    // process.on("SIGTERM", this.gracefulShutdown);
  }

  private async consumerOptions(): Promise<ConsumerConfig> {
    return {
      durable_name: this.durableName,
      ack_policy: this.ackPolicy,
      filter_subject: this.filterSubject,
      deliver_policy: this.deliverPolicy,
      replay_policy: this.replayPolicy,
      max_ack_pending: this.maxAckPending, // For ordering purposes, but impacts performance
      ack_wait: this.ackWait, //Default is 30 seconds
    };
  }

  public async listen() {
    const consumerOptions = await this.consumerOptions();

    // await jsm.consumers.delete(this.streamName, this.durableName);
    this.client = this.nc.jetstream();

    this.manager = await this.client.jetstreamManager();

    await this.manager.consumers.add(this.streamName, consumerOptions);

    const consumer = await this.client.consumers.get(
      this.streamName,
      this.durableName,
    );

    // Reason it is wrapped in a loop is bcs, in case there is failure, it will re-setup consume and continue
    while (true) {
      console.log("Watching for messages...");

      const messages = await consumer.consume();
      try {
        for await (const m of messages) {
          // if (this.shouldShutdown) {
          // console.log("Stopping message consumption due to shutdown signal");

          // We can instead process the last message before shutting down to avoid the use of max ack pending for ordering cases
          // NOTE: New Jetstream API supports ordering by default
          //
          // console.log(
          //   `Message received: ${m.subject} / ${this.durableName}, sequence_number: ${m.seq}`,
          // );
          //
          // const parsedData = this.parseMessage(m);
          // this.onMessage(parsedData, m);
          // console.log(
          //   "Acknowledged last message received successfully...",
          // );
          // break;
          // }

          console.log(
            `Message received: ${m.subject} / ${this.durableName}, sequence_number: ${m.seq}, redilevered: ${m.redelivered}`,
          );

          const parsedData = this.parseMessage(m);
          await this.onMessage(parsedData, m);
          // if (m.info.pending === 0) break;
        }
      } catch (err: any) {
        console.error(`Consume failed: ${err.message}`);
      }
    }
    // await this.cleanup(this.nc);
  }

  private parseMessage(msg: JsMsg) {
    const dataString = new TextDecoder().decode(msg.data);

    try {
      const dataObject = JSON.parse(dataString);
      return dataObject;
    } catch (err: any) {
      console.error("Data is not valid JSON");
      throw new Error(err.message);
    }
  }

  // private async cleanup(nc: NatsConnection) {
  //   try {
  //     console.info("Draining connection...");
  //     await nc.drain();
  //     console.log("Connection drained!");
  //   } catch (err: any) {
  //     console.log(`Error encountered: ${err}`);
  //   } finally {
  //     await nc.close();
  //     console.log("Connection closed");
  //     console.log("########");
  //     process.exit();
  //   }
  // }

  //NOTE: Reason for a graceful shutdown is for resource cleanup and for graceful failovers (other clients can take over)

  // private gracefulShutdown = () => {
  //   this.shouldShutdown = true;
  //   console.log("Preparing to close the connection...");
  // };
}
