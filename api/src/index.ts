import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { AttendanceRouter } from "./routers/attendance.router";
import { OutletRouter } from "./routers/outlet.router";
import { EmployeeRouter } from "./routers/employee.router";
import { PickupRouter } from "./routers/pickup.router";
import { DeliveryRouter } from "./routers/delivery.routes";
import { RequestRouter } from "./routers/driver.router";
import { NotificationRouter } from "./routers/notification";
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
const pickupRouter = new PickupRouter();
const deliveryRouter = new DeliveryRouter();
const requestRouter = new RequestRouter();
const notificationRouter = new NotificationRouter();
const authRouter = new AuthRouter();
const outletRouter = new OutletRouter();
const employeeRouter = new EmployeeRouter();
const userRouter = new UserRouter()

app.use("/api/attendance", attendanceRouter.getRouter())
app.use("/api/pickup", pickupRouter.getRouter())
app.use("/api/delivery", deliveryRouter.getRouter())
app.use("/api/request", requestRouter.getRouter())
app.use("/api/notification", notificationRouter.getRouter())
app.use("/api/auth", authRouter.getRouter());
app.use("/api/outlet", outletRouter.getRouter());
app.use("/api/employee", employeeRouter.getRouter());
app.use("/api/user", userRouter.getRouter());

app.listen(PORT, () => {
  console.log(`server running on -> http://localhost:${PORT}/api`);
});
