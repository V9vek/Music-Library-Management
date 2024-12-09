import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//routes
import userRouter from "./routes/user.routes.js";
import artistRouter from "./routes/artist.routes.js";

app.use("/api/v1", userRouter);
app.use("/api/v1/artists", artistRouter);

export { app };
