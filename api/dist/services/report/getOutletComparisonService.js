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
    return __awaiter(this, arguments, void 0, function* (timeframe = "monthly") {
        try {
            // Get all active outlets
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
            // Determine date range based on timeframe
            const now = new Date();
            let dateStart;
            let dateEnd = (0, date_fns_1.endOfDay)(now);
            switch (timeframe) {
                case "daily":
                    // Today only
                    dateStart = (0, date_fns_1.startOfDay)(now);
                    break;
                case "weekly":
                    // Use last 7 days instead of current week - more likely to have data
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 6)); // 6 days ago + today = 7 days
                    dateEnd = (0, date_fns_1.endOfDay)(now);
                    break;
                case "monthly":
                    // Current month
                    dateStart = (0, date_fns_1.startOfMonth)(now);
                    dateEnd = (0, date_fns_1.endOfMonth)(now);
                    break;
                case "yearly":
                    // Current year
                    dateStart = (0, date_fns_1.startOfYear)(now);
                    dateEnd = (0, date_fns_1.endOfYear)(now);
                    break;
                case "custom":
                    // Last 30 days for custom if no specific dates provided
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 29));
                    break;
                default:
                    // Default to last 30 days
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 29));
            }
            console.log(`Generating outlet comparison for timeframe ${timeframe} from ${(0, date_fns_1.format)(dateStart, 'yyyy-MM-dd')} to ${(0, date_fns_1.format)(dateEnd, 'yyyy-MM-dd')}`);
            // Collect metrics for each outlet
            const outletMetrics = yield Promise.all(outlets.map((outlet) => __awaiter(this, void 0, void 0, function* () {
                // Find orders through the Order model directly, filtering by outlet via the pickup order
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
                console.log(`Found ${orders.length} orders for outlet ${outlet.outletName} in the selected timeframe`);
                // Calculate total revenue
                let revenue = 0;
                orders.forEach(order => {
                    // Add payment amounts
                    revenue += order.payment.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                    // Add pickup price if exists
                    if (order.pickupOrder) {
                        revenue += order.pickupOrder.pickupPrice || 0;
                    }
                    // Add delivery price if exists
                    if (order.deliveryOrder && order.deliveryOrder.length > 0) {
                        revenue += order.deliveryOrder[0].deliveryPrice || 0;
                    }
                });
                // Get unique customer IDs from pickup orders
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
