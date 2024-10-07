import {
  JetStreamClient,
  JetStreamManager,
  RetentionPolicy,
  StreamConfig,
  JSONCodec,
} from "nats";
import { Subjects } from "./subjects.js";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  private client: JetStreamClient;
  private manager: JetStreamManager;
  private codec = JSONCodec();
  abstract subject: T["subject"];
  protected abstract streamName: string;
  protected abstract retentionPolicy: RetentionPolicy;
  private streamSetupCompleted = false;

  constructor(manager: JetStreamManager, client: JetStreamClient) {
    this.client = client;
    this.manager = manager;
    // this.setupStream().catch((err) =>
    //   console.error(`Failed setting up stream ${this.streamName}: `, err),
    // );
  }

  private async setupStream() {
    // if (this.streamSetupCompleted) return;
    try {
      await this.manager.streams.info(this.streamName);
      console.log(`Stream ${this.streamName} already exists`);
    } catch (err: any) {
      if (err.code === "404") {
        const streamConfig: Partial<StreamConfig> = {
          name: this.streamName,
          retention: this.retentionPolicy,
          subjects: [this.subject.split(".")[0] + ".>"],
        };

        await this.manager.streams.add(streamConfig);
        console.log(`Stream ${this.streamName} has been created`);
      } else {
        console.error(`Unexpected error occurred: ${err}`);
      }
    }
    this.streamSetupCompleted = true;
  }

  async publish(data: T["data"]) {
    if (!this.streamSetupCompleted) {
      console.info("Setting up stream...");
      await this.setupStream();
    }

    try {
      const encodedData = this.codec.encode(data);
      const ack = await this.client.publish(this.subject, encodedData);
      console.log(
        `Published on subject: ${this.subject} to stream: ${this.streamName}, ack sequence: ${ack.seq}\n`,
      );
    } catch (err) {
      console.error(`Failed to publish message, unexpected error: ${err}`);
    }
  }
}
