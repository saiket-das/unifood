import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";

const app: Application = express();

// parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true, // allow all origins for troubleshooting (change back later)
    credentials: true,
  })
);

// routes
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running now!");
});

// app.use(globalErrorHandler);

// Not found (404) route
// app.use(notFound);

export default app;
