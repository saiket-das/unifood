import mongoose from "mongoose";
import "module-alias/register";
import { Server } from "http";
import app from "./app";
import config from "./app/config";

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    server = app.listen(config.port, () => {
      console.log(`Server is listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

// handle unhandled rejection
process.on("unhandledRejection", () => {
  console.log("⚠️ Unhandled Rejection is detected. Shutting down...");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// handle uncaught exception
process.on("uncaughtException", () => {
  console.log("⚠️ Uncaught Exception is detected. Shutting down...");
  process.exit(1);
});
