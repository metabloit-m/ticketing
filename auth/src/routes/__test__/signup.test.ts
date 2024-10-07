import request from "supertest";
import { app } from "../../app.js";

it("returns a 201 on successful sign up", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@gmail.com",
      password: "password",
    })
    .expect(201);
});

it("returns 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test.com",
      password: "mosesminja",
    })
    .expect(400);
});

it("returns 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test.com",
      password: "mosa",
    })
    .expect(400);
});

it("returns 400 with empty email or password", async () => {
  return request(app).post("/api/users/signup").send({}).expect(400);
});

it("it disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "mosesminja" })
    .expect(201);
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "mosesminja" })
    .expect(400);
});

it("sets a cookie after successful sign up", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "mosesminja" })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
