import express from "express";
import dotenv from "dotenv";
import router from "./routes/app.router";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use("/", router);

app.listen(PORT);

export default app;
