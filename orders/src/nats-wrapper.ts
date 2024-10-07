import {
  connect,
  ConnectionOptions,
  JetStreamClient,
  JetStreamManager,
  NatsConnection,
  RetentionPolicy,
} from "nats";

class NatsWrapper {
  #client?: NatsConnection;
  #js?: JetStreamClient;
  #jsm?: JetStreamManager;
  // #streamName: string = "ORDERS";
  // #streamSubjects: string[] = ["order.>"];

  get client() {
    if (!this.#client) {
      throw new Error("Cannot get client before connecting first");
    }
    return this.#client;
  }

  get js() {
    if (!this.#js) {
      throw new Error("Cannot get jetstream client before connecting first");
    }
    return this.#js;
  }

  get jsm() {
    if (!this.#jsm) {
      throw new Error("Cannot get jetstream manager before connecting first");
    }
    return this.#jsm;
  }

  // get streamName(): string {
  //   return this.#streamName;
  // }

  async connect(connectionOptions: ConnectionOptions) {
    try {
      this.#client = await connect(connectionOptions);
      console.info(`Connected successfully to NATS`);

      this.#js = this.client.jetstream();
      this.#jsm = await this.#js.jetstreamManager();
      console.info(`Connected successfully to Jetstream manager`);

      // await this.jsm.streams.info(this.#streamName);
      // console.info(
      //   `${this.#streamName} already exists, no need of creating stream`,
      // );
    } catch (err: any) {
      // if (err.code === "404") {
      //   console.info(`Creating stream: ${this.#streamName}...`);
      //   await this.jsm.streams.add({
      //     name: this.#streamName,
      //     retention: RetentionPolicy.Interest,
      //     subjects: this.#streamSubjects,
      //   });
      //
      //   console.log(`Stream ${this.#streamName} has been created`);
      // } else {
      console.error(`Connection failed due to: ${err}`);
    }
  }
}

export const natswrapper = new NatsWrapper();
