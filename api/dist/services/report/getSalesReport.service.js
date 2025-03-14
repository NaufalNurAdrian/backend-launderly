"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesReportService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const date_fns_1 = require("date-fns");
const getSalesReportService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { id, filterOutlet, filterMonth, filterYear, timeframe = "monthly", startDate, endDate } = query;
        console.log("Sales report query:", {
            filterOutlet,
            filterMonth,
            filterYear,
            timeframe,
            startDate,
            endDate,
            userId: id
        });
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { id },
            select: {
                employee: {
                    select: {
                        outlet: { select: { id: true, outletName: true } }
                    }
                },
                role: true,
            },
        });
        if (!existingUser)
            throw new Error("User not found!");
        const orderWhereClause = {};
        if (existingUser.role === "OUTLET_ADMIN") {
            if (!((_b = (_a = existingUser.employee) === null || _a === void 0 ? void 0 : _a.outlet) === null || _b === void 0 ? void 0 : _b.id)) {
                throw new Error("Outlet admin is not assigned to any outlet");
            }
            orderWhereClause.pickupOrder = {
                outletId: existingUser.employee.outlet.id
            };
        }
        else if (existingUser.role === "SUPER_ADMIN") {
            if (filterOutlet !== "all") {
                orderWhereClause.pickupOrder = {
                    outletId: Number(filterOutlet)
                };
            }
        }
        else {
            orderWhereClause.pickupOrder = {
                outletId: (_d = (_c = existingUser.employee) === null || _c === void 0 ? void 0 : _c.outlet) === null || _d === void 0 ? void 0 : _d.id
            };
        }
        const allOrders = yield prisma_1.default.order.findMany({
            where: orderWhereClause,
        });
        let totalOrders = allOrders.length;
        let receivedAtOutlet = allOrders.filter(order => order.orderStatus === "ARRIVED_AT_OUTLET").length;
        let onProgress = allOrders.filter(order => ["READY_FOR_WASHING", "BEING_WASHED", "WASHING_COMPLETED", "BEING_IRONED", "IRONING_COMPLETED", "BEING_PACKED"].includes(order.orderStatus)).length;
        let completed = allOrders.filter(order => order.orderStatus === "COMPLETED").length;
        const now = new Date();
        const year = filterYear ? Number(filterYear) : now.getFullYear();
        const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();
        let timeframeStartDate;
        let timeframeEndDate;
        if (timeframe === "custom" && startDate && endDate) {
            try {
                timeframeStartDate = (0, date_fns_1.parseISO)(startDate);
                timeframeEndDate = (0, date_fns_1.parseISO)(endDate);
                timeframeStartDate.setHours(0, 0, 0, 0);
                timeframeEndDate.setHours(23, 59, 59, 999);
            }
            catch (error) {
                console.error("Error parsing date:", error);
                throw new Error(`Invalid date format: startDate=${startDate}, endDate=${endDate}`);
            }
        }
        else {
            switch (timeframe) {
                case "daily":
                    timeframeStartDate = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 29));
                    timeframeEndDate = (0, date_fns_1.endOfDay)(now);
                    break;
                case "weekly":
                    timeframeStartDate = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 6));
                    timeframeEndDate = (0, date_fns_1.endOfDay)(now);
                    break;
                case "monthly":
                    timeframeStartDate = (0, date_fns_1.startOfYear)(new Date(year, 0, 1));
                    timeframeEndDate = (0, date_fns_1.endOfYear)(new Date(year, 11, 31));
                    break;
                case "yearly":
                    const startYear = now.getFullYear() - 4;
                    timeframeStartDate = (0, date_fns_1.startOfYear)(new Date(startYear, 0, 1));
                    timeframeEndDate = (0, date_fns_1.endOfYear)(now);
                    break;
                default:
                    timeframeStartDate = (0, date_fns_1.startOfYear)(new Date(year, 0, 1));
                    timeframeEndDate = (0, date_fns_1.endOfYear)(new Date(year, 11, 31));
            }
        }
        console.log(`Using timeframe ${timeframe} from ${(0, date_fns_1.format)(timeframeStartDate, 'yyyy-MM-dd')} to ${(0, date_fns_1.format)(timeframeEndDate, 'yyyy-MM-dd')}`);
        const timeframeWhereClause = Object.assign({}, orderWhereClause);
        timeframeWhereClause.createdAt = {
            gte: timeframeStartDate,
            lte: timeframeEndDate
        };
        timeframeWhereClause.payment = {
            some: {
                paymentStatus: "SUCCESSED"
            }
        };
        const timeframeOrders = yield prisma_1.default.order.findMany({
            where: timeframeWhereClause,
            include: {
                payment: {
                    where: {
                        paymentStatus: "SUCCESSED"
                    }
                },
                pickupOrder: true,
                deliveryOrder: true
            }
        });
        console.log(`Found ${timeframeOrders.length} orders in the selected timeframe`);
        let totalIncome = 0;
        let totalTransaction = timeframeOrders.length;
        let totalWeight = 0;
        timeframeOrders.forEach(order => {
            var _a;
            const laundryPayments = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
            let orderIncome = laundryPayments;
            if (order.pickupOrder) {
                orderIncome += order.pickupOrder.pickupPrice;
            }
            if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
                orderIncome += order.deliveryOrder[0].deliveryPrice;
            }
            else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
                const delivery = order.deliveryOrder;
                orderIncome += Number(delivery.deliveryPrice) || 0;
            }
            totalIncome += orderIncome;
            totalWeight += (_a = order.weight) !== null && _a !== void 0 ? _a : 0;
        });
        let dateLabels = [];
        let incomeDaily = [];
        let transactionDaily = [];
        let weightDaily = [];
        if (timeframe === "daily" || timeframe === "weekly" || timeframe === "custom") {
            const days = (0, date_fns_1.eachDayOfInterval)({
                start: timeframeStartDate,
                end: timeframeEndDate
            });
            dateLabels = days.map(date => (0, date_fns_1.format)(date, 'yyyy-MM-dd'));
            incomeDaily = new Array(dateLabels.length).fill(0);
            transactionDaily = new Array(dateLabels.length).fill(0);
            weightDaily = new Array(dateLabels.length).fill(0);
            timeframeOrders.forEach(order => {
                var _a;
                const orderDate = new Date(order.createdAt);
                const formattedOrderDate = (0, date_fns_1.format)(orderDate, 'yyyy-MM-dd');
                const dayIndex = dateLabels.indexOf(formattedOrderDate);
                if (dayIndex !== -1) {
                    let orderIncome = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
                    if (order.pickupOrder) {
                        orderIncome += order.pickupOrder.pickupPrice;
                    }
                    if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
                        orderIncome += order.deliveryOrder[0].deliveryPrice;
                    }
                    else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
                        const delivery = order.deliveryOrder;
                        orderIncome += Number(delivery.deliveryPrice) || 0;
                    }
                    incomeDaily[dayIndex] += orderIncome;
                    transactionDaily[dayIndex] += 1;
                    weightDaily[dayIndex] += (_a = order.weight) !== null && _a !== void 0 ? _a : 0;
                }
            });
        }
        const incomeMonthly = new Array(12).fill(0);
        const transactionMonthly = new Array(12).fill(0);
        const weightMonthly = new Array(12).fill(0);
        if (timeframe === "monthly") {
            for (let month = 0; month < 12; month++) {
                const monthStart = (0, date_fns_1.startOfMonth)(new Date(year, month));
                const monthEnd = (0, date_fns_1.endOfMonth)(new Date(year, month));
                const monthOrders = timeframeOrders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= monthStart && orderDate <= monthEnd;
                });
                let monthIncome = 0;
                let monthWeight = 0;
                monthOrders.forEach(order => {
                    var _a;
                    let orderIncome = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
                    if (order.pickupOrder) {
                        orderIncome += order.pickupOrder.pickupPrice;
                    }
                    if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
                        orderIncome += order.deliveryOrder[0].deliveryPrice;
                    }
                    else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
                        const delivery = order.deliveryOrder;
                        orderIncome += Number(delivery.deliveryPrice) || 0;
                    }
                    monthIncome += orderIncome;
                    monthWeight += (_a = order.weight) !== null && _a !== void 0 ? _a : 0;
                });
                incomeMonthly[month] = monthIncome;
                transactionMonthly[month] = monthOrders.length;
                weightMonthly[month] = monthWeight;
            }
        }
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 4;
        const pastYears = Array.from({ length: 5 }, (_, i) => startYear + i);
        const incomeYearly = new Array(pastYears.length).fill(0);
        const transactionYearly = new Array(pastYears.length).fill(0);
        const weightYearly = new Array(pastYears.length).fill(0);
        if (timeframe === "yearly") {
            pastYears.forEach((year, index) => {
                const yearStart = (0, date_fns_1.startOfYear)(new Date(year, 0, 1));
                const yearEnd = (0, date_fns_1.endOfYear)(new Date(year, 11, 31));
                const yearOrders = timeframeOrders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= yearStart && orderDate <= yearEnd;
                });
                let yearIncome = 0;
                let yearWeight = 0;
                yearOrders.forEach(order => {
                    var _a;
                    let orderIncome = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
                    if (order.pickupOrder) {
                        orderIncome += order.pickupOrder.pickupPrice;
                    }
                    if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
                        orderIncome += order.deliveryOrder[0].deliveryPrice;
                    }
                    else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
                        const delivery = order.deliveryOrder;
                        orderIncome += Number(delivery.deliveryPrice) || 0;
                    }
                    yearIncome += orderIncome;
                    yearWeight += (_a = order.weight) !== null && _a !== void 0 ? _a : 0;
                });
                incomeYearly[index] = yearIncome;
                transactionYearly[index] = yearOrders.length;
                weightYearly[index] = yearWeight;
            });
        }
        let outletInfo = null;
        if (existingUser.role === "OUTLET_ADMIN" && ((_e = existingUser.employee) === null || _e === void 0 ? void 0 : _e.outlet)) {
            outletInfo = {
                id: existingUser.employee.outlet.id,
                name: existingUser.employee.outlet.outletName
            };
        }
        console.log("Sales report calculation complete");
        return {
            message: "Successfully fetched sales report",
            result: {
                totalIncome,
                totalTransaction,
                totalOrders,
                receivedAtOutlet,
                onProgress,
                completed,
                totalWeight,
                incomeDaily,
                transactionDaily,
                weightDaily,
                incomeMonthly,
                transactionMonthly,
                weightMonthly,
                pastYears,
                incomeYearly,
                transactionYearly,
                weightYearly,
                timeframe,
                dateLabels,
                outletInfo,
                hasData: totalIncome > 0
            },
        };
    }
    catch (error) {
        console.error("Error in getSalesReportService:", error);
        throw error;
    }
});
exports.getSalesReportService = getSalesReportService;
