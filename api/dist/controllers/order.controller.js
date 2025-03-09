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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const bypass_service_1 = require("../services/order/bypass.service");
const getOrders_1 = require("../services/order/getOrders");
const updateOrder_service_1 = require("../services/order/updateOrder.service");
class OrderController {
    createOrderController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield (0, updateOrder_service_1.UpdateOrderService)(req.body);
                res.status(200).send({ message: "successfuly create order", order });
            }
            catch (error) {
                res.status(500).send({ message: "Cannot create order" });
            }
        });
    }
    getOrdersController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).send({ message: "Unauthorized: User ID not found" });
                }
                const query = {
                    id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    take: req.query.take ? parseInt(req.query.take) : 1000000,
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    sortBy: req.query.sortBy ? req.query.sortBy : "id",
                    sortOrder: req.query.sortOrder ? req.query.sortOrder : "asc",
                    filterOutlet: req.query.filterOutlet && req.query.filterOutlet !== "all"
                        ? parseInt(req.query.filterOutlet)
                        : "all",
                    filterStatus: req.query.filterStatus ? req.query.filterStatus : "all",
                    filterDate: req.query.filterDate ? new Date(req.query.filterDate) : undefined,
                    search: req.query.search ? req.query.search : "",
                    filterCategory: req.query.filterCategory ? req.query.filterCategory : "",
                };
                const getOrder = yield (0, getOrders_1.getOrdersService)(query);
                res.status(200).send({ message: "Successfully fetched orders", getOrder });
            }
            catch (error) {
                res.status(500).send({ message: "Cannot get orders", error: error.message });
            }
        });
    }
    bypassOrderController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bypassOrder = yield (0, bypass_service_1.bypassOrderService)(req.body);
                res.status(200).send({ message: "Successuly bypass order", bypassOrder });
            }
            catch (error) {
                res.status(500).send({ message: "Cannot Bypass Order", error });
            }
        });
    }
}
exports.OrderController = OrderController;
