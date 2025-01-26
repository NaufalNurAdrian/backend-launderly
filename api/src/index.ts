import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { OutletRouter } from "./routers/outlet.router";


const PORT: number = 8000;

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: [`${process.env.BASE_URL_FE}`],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Welcome to my API");
});

const outletRouter = new OutletRouter();

app.use("/api/outlet", outletRouter.getRouter());


app.listen(PORT, () => {
    console.log(`server running on -> http://localhost:${PORT}/api`);
  });