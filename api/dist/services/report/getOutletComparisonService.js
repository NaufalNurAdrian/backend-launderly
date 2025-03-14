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
exports.getOutletComparisonService = getOutletComparisonService;
const prisma_1 = __importDefault(require("../../prisma"));
const date_fns_1 = require("date-fns");
function getOutletComparisonService() {
    return __awaiter(this, arguments, void 0, function* (timeframe = "monthly", startDateParam, endDateParam) {
        try {
            const outlets = yield prisma_1.default.outlet.findMany({
                where: {
                    isDelete: false
                },
                select: {
                    id: true,
                    outletName: true,
                    outletType: true
                }
            });
            const now = new Date();
            let dateStart;
            let dateEnd = (0, date_fns_1.endOfDay)(now);
            if (timeframe === "custom" && startDateParam && endDateParam) {
                try {
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(startDateParam));
                    dateEnd = (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(endDateParam));
                    console.log(`Custom date range parsed successfully: ${(0, date_fns_1.format)(dateStart, 'yyyy-MM-dd')} to ${(0, date_fns_1.format)(dateEnd, 'yyyy-MM-dd')}`);
                }
                catch (error) {
                    console.error("Error parsing custom date parameters:", error);
                    try {
                        dateStart = new Date(startDateParam);
                        dateEnd = new Date(endDateParam);
                        dateStart.setHours(0, 0, 0, 0);
                        dateEnd.setHours(23, 59, 59, 999);
                    }
                    catch (fallbackError) {
                        console.error("Fallback date parsing also failed:", fallbackError);
                        dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 30));
                        console.log(`Falling back to last 30 days: ${(0, date_fns_1.format)(dateStart, 'yyyy-MM-dd')} to ${(0, date_fns_1.format)(dateEnd, 'yyyy-MM-dd')}`);
                    }
                }
            }
            else {
                switch (timeframe) {
                    case "daily":
                        dateStart = (0, date_fns_1.startOfDay)(now);
                        dateEnd = (0, date_fns_1.endOfDay)(now);
                        break;
                    case "weekly":
                        dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 6));
                        dateEnd = (0, date_fns_1.endOfDay)(now);
                        break;
                    case "monthly":
                        dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 29));
                        dateEnd = (0, date_fns_1.endOfDay)(now);
                        break;
                    case "yearly":
                        dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 364));
                        dateEnd = (0, date_fns_1.endOfDay)(now);
                        break;
                    default:
                        dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 29));
                        dateEnd = (0, date_fns_1.endOfDay)(now);
                }
            }
            const outletMetrics = yield Promise.all(outlets.map((outlet) => __awaiter(this, void 0, void 0, function* () {
                const orders = yield prisma_1.default.order.findMany({
                    where: {
                        pickupOrder: {
                            outletId: outlet.id
                        },
                        createdAt: {
                            gte: dateStart,
                            lte: dateEnd
                        },
                        payment: {
                            some: {
                                paymentStatus: "SUCCESSED"
                            }
                        }
                    },
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
                let revenue = 0;
                orders.forEach(order => {
                    revenue += order.payment.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                    if (order.pickupOrder) {
                        revenue += order.pickupOrder.pickupPrice || 0;
                    }
                    if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
                        revenue += order.deliveryOrder[0].deliveryPrice || 0;
                    }
                    else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
                        const delivery = order.deliveryOrder;
                        revenue += Number(delivery.deliveryPrice) || 0;
                    }
                });
                const customerIds = orders.map(order => { var _a; return (_a = order.pickupOrder) === null || _a === void 0 ? void 0 : _a.userId; }).filter(Boolean);
                const uniqueCustomerIds = new Set(customerIds);
                return {
                    id: outlet.id,
                    name: outlet.outletName,
                    type: outlet.outletType,
                    revenue: revenue,
                    orders: orders.length,
                    customers: uniqueCustomerIds.size
                };
            })));
            return {
                outlets: outletMetrics,
                timeframe,
                dateRange: {
                    from: dateStart,
                    to: dateEnd
                }
            };
        }
        catch (error) {
            console.error("Error in getOutletComparisonService:", error);
            throw new Error(`Error generating outlet comparison: ${error.message}`);
        }
    });
}
