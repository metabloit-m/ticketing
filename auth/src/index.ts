import express from "express";
import { json } from "body-parser";
import { app } from "./app.js";
import mongoose from "mongoose";
import http from "http";

const run = async () => {
  console.info("Starting ....");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT key must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO URI must be defined");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("Connected to auth mongoDB");
  } catch (error) {
    console.error(error);
  }

  const server = http.createServer(app);

  server.keepAliveTimeout = 61000;
  server.headersTimeout = 62000;

  server.listen(3000, () => {
    console.log("Listening on port 3000!!");
  });
};

run();
