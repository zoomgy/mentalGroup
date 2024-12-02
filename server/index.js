import e from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
const PORT = 3000;
const app = e();

import UserRouter from "./routes/user.route.js";
const FRONTEND_URL = "http://localhost:5173";
const MONGODB_URL =
  "mongodb+srv://ayushsinghcs21:TUDibiyrftw7o9P4@cluster0.hel7c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

//Connecting DataBase
(async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("DataBase Connected");
  } catch (error) {
    console.log("Cannot Connect To Database");
  }
})();
app.use(e.json());
// Using Cross Origin Request
app.use(
  cors({
    origin: `${FRONTEND_URL}`,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(UserRouter);

// Stating Server on the port.
app.listen(process.env.PORT || PORT, () => {
  console.log(`Server Listening at PORT: ${process.env.PORT || PORT}`);
});
