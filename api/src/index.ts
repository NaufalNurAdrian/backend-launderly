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
import { NotificationRouter } from "./routers/notification.router";
import { AuthRouter } from "./routers/auth.router";
import { UserRouter } from "./routers/user";
import { OrderWorkerRouter } from "./routers/workerOrder.router";
import { BypassRouter } from "./routers/bypass.router";
import { AddressRouter } from "./routers/address.router";
import { PickupOrderRouter } from "./routers/pickupOrder.router";
import { PaymentRouter } from "./routers/payment.router";
import { ReportRouter } from "./routers/report.router";
import { OrderRouter } from "./routers/order.router";
import { ItemRouter } from "./routers/item.router";

const PORT: number = 8000;

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: `${process.env.BASE_URL_FE}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

console.log("Allowed origin:", process.env.BASE_URL_FE);


app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Welcome to my Launderly API");
});

const attendanceRouter = new AttendanceRouter();
const pickupRouter = new PickupRouter();
const deliveryRouter = new DeliveryRouter();
const requestRouter = new RequestRouter();
const orderRouter = new OrderWorkerRouter();
const bypassRouter = new BypassRouter();
const notificationRouter = new NotificationRouter();
const authRouter = new AuthRouter();
const outletRouter = new OutletRouter();
const employeeRouter = new EmployeeRouter();
const userRouter = new UserRouter();
const addressRouter = new AddressRouter();
const pickupOrderRouter = new PickupOrderRouter();
const paymentRouter = new PaymentRouter();
const reportRouter = new ReportRouter();
const orderAdminRouter = new OrderRouter();
const itemRouter = new ItemRouter();

app.use("/api/attendance", attendanceRouter.getRouter());
app.use("/api/pickup", pickupRouter.getRouter());
app.use("/api/delivery", deliveryRouter.getRouter());
app.use("/api/request", requestRouter.getRouter());
app.use("/api/order", orderRouter.getRouter());
app.use("/api/bypass", bypassRouter.getRouter());
app.use("/api/notification", notificationRouter.getRouter());
app.use("/api/auth", authRouter.getRouter());
app.use("/api/outlet", outletRouter.getRouter());
app.use("/api/employee", employeeRouter.getRouter());
app.use("/api/user", userRouter.getRouter());
app.use("/api/address", addressRouter.getRouter());
app.use("/api/pickupOrder", pickupOrderRouter.getRouter());
app.use("/api/payment", paymentRouter.getRouter());
app.use("/api/report", reportRouter.getRouter());
app.use("/api/orders", orderAdminRouter.getRouter());
app.use("/api/item", itemRouter.getRouter());

app.listen(PORT, () => {
  console.log(`server running on -> http://localhost:${PORT}/api`);
});
