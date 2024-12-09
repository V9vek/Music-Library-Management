require("dotenv").config();

import connectDB from "./db/db.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is up and running at ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.error("MONGODB connection failed: ", err);
  });
