import express from "express";
import dotenv from "dotenv";
import router from "./routes/app.router";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`);
});

export default app;
