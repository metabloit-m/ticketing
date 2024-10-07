import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import { natswrapper } from "../__mocks__/nats-wrapper.js";

declare global {
  function signin(): string[];
}

jest.unstable_mockModule("../nats-wrapper", () => {
  return {
    natswrapper,
  };
});

let mongod: any;

beforeAll(async () => {
  process.env.JWT_KEY = "moses";

  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();

  await mongoose.connect(mongoUri);
  console.log(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongod.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  // NOTE: The reason why we are doing all these steps is becasuse:
  // 1. First we do not want to make a request to another service as we want each service to be independent, especially during testing.
  // 2. Usually when a token is stored in a cookie when using the "cookie-session" library, it is encoded as a base64 value, so what we are doing here in the following lines is replicating the whole process and returning the string in the format: `session=base64_value`. Also, we are including it in an array just to default to supertest library returning values behaviour.

  const id = new mongoose.Types.ObjectId().toHexString();

  const payload = {
    id,
    email: "test@gmail.com",
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = {
    jwt: token,
  };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};
