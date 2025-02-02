import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { AttendanceRouter } from "./routers/attendance.router";
import { OutletRouter } from "./routers/outlet.router";
import { EmployeeRouter } from "./routers/employee.router";
import { AuthRouter } from "./routers/auth.router";
import { UserRouter } from "./routers/user";


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
  res.status(200).send("Welcome to my Launderly API");
});

const attendanceRouter = new AttendanceRouter()
<<<<<<< HEAD
=======
const authRouter = new AuthRouter();
>>>>>>> 96b306485324b8941142f9717854f7f56460c6ef
const outletRouter = new OutletRouter();
const employeeRouter = new EmployeeRouter();
const userRouter = new UserRouter()

app.use("/api/attendance", attendanceRouter.getRouter())
<<<<<<< HEAD
=======
app.use("/api/auth", authRouter.getRouter());
>>>>>>> 96b306485324b8941142f9717854f7f56460c6ef
app.use("/api/outlet", outletRouter.getRouter());
app.use("/api/employee", employeeRouter.getRouter());
app.use("/api/user", userRouter.getRouter());

app.listen(PORT, () => {
  console.log(`server running on -> http://localhost:${PORT}/api`);
});
