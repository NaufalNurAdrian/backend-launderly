"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const attendance_router_1 = require("./routers/attendance.router");
const outlet_router_1 = require("./routers/outlet.router");
const employee_router_1 = require("./routers/employee.router");
const pickup_router_1 = require("./routers/pickup.router");
const delivery_routes_1 = require("./routers/delivery.routes");
const driver_router_1 = require("./routers/driver.router");
const notification_router_1 = require("./routers/notification.router");
const auth_router_1 = require("./routers/auth.router");
const user_1 = require("./routers/user");
const workerOrder_router_1 = require("./routers/workerOrder.router");
const bypass_router_1 = require("./routers/bypass.router");
const address_router_1 = require("./routers/address.router");
const pickupOrder_router_1 = require("./routers/pickupOrder.router");
const payment_router_1 = require("./routers/payment.router");
const report_router_1 = require("./routers/report.router");
const order_router_1 = require("./routers/order.router");
const item_router_1 = require("./routers/item.router");
const PORT = 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: `${process.env.BASE_URL_FE}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
<<<<<<< HEAD
=======
console.log("Allowed origin:", process.env.BASE_URL_FE);
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
app.get("/api", (req, res) => {
    res.status(200).send("Welcome to my Launderly API");
});
const attendanceRouter = new attendance_router_1.AttendanceRouter();
const pickupRouter = new pickup_router_1.PickupRouter();
const deliveryRouter = new delivery_routes_1.DeliveryRouter();
const requestRouter = new driver_router_1.RequestRouter();
const orderRouter = new workerOrder_router_1.OrderWorkerRouter();
const bypassRouter = new bypass_router_1.BypassRouter();
const notificationRouter = new notification_router_1.NotificationRouter();
const authRouter = new auth_router_1.AuthRouter();
const outletRouter = new outlet_router_1.OutletRouter();
const employeeRouter = new employee_router_1.EmployeeRouter();
const userRouter = new user_1.UserRouter();
const addressRouter = new address_router_1.AddressRouter();
const pickupOrderRouter = new pickupOrder_router_1.PickupOrderRouter();
const paymentRouter = new payment_router_1.PaymentRouter();
const reportRouter = new report_router_1.ReportRouter();
const orderAdminRouter = new order_router_1.OrderRouter();
const itemRouter = new item_router_1.ItemRouter();
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
