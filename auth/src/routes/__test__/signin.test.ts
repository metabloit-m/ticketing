import request from "supertest";
import { app } from "../../app.js";

it("fails when an email that does not exist is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "passwordhere" })
    .expect(400);
});

it("fails when an incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "passwordhere" })
    .expect(201);
  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "wrongpasswordhere" })
    .expect(400);
});

it("sets cookie when a correct password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "passwordhere" })
    .expect(201);
  const response = await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "passwordhere" })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
