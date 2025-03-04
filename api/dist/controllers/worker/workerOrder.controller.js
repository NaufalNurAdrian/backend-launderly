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
exports.OrderWorkerController = void 0;
const getOrders_service_1 = require("../../services/worker/order/getOrders.service");
const createOrderWorker_service_1 = require("../../services/worker/order/createOrderWorker.service");
const finishOrder_service_1 = require("../../services/worker/order/finishOrder.service");
const getOrderHistory_service_1 = require("../../services/worker/order/getOrderHistory.service");
const getOrderItem_1 = require("../../services/worker/order/getOrderItem");
class OrderWorkerController {
    getOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { order, sortBy, page, pageSize } = req.query;
                const result = yield (0, getOrders_service_1.getWorkerOrdersService)({
                    workerId: workerId,
                    sortBy: sortBy,
                    order: order,
                    page: page ? parseInt(page) : 1,
                    pageSize: pageSize ? parseInt(pageSize) : 4,
                });
                res.status(200).send({
                    station: result.station,
                    data: result.data,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
    }
    getOrderHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { order, sortBy, page, pageSize } = req.query;
                const result = yield (0, getOrderHistory_service_1.getWorkerOrdersHistoryService)({
                    workerId: workerId,
                    sortBy: sortBy,
                    order: order,
                    page: page ? parseInt(page) : 1,
                    pageSize: pageSize ? parseInt(pageSize) : 4,
                });
                res.status(200).send({
                    station: result.station,
                    data: result.data,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
    }
    createOrderWorker(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { orderId } = req.params;
                const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield (0, createOrderWorker_service_1.createOrderWorker)({
                    workerId: workerId,
                    orderId: parseInt(orderId),
                });
                res.status(200).send({ message: "order created", data: result });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
    }
    finishOrderWorker(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { orderId } = req.params;
                const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield (0, finishOrder_service_1.updateOrderStatus)({
                    workerId: workerId,
                    orderId: parseInt(orderId),
                });
                res.status(200).send({ message: "order completed", data: result });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
    }
    getOrderItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { orderId } = req.params;
                const result = yield (0, getOrderItem_1.getOrderItem)(parseInt(orderId));
                res.status(200).send({ message: "order item", data: result });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
    }
}
exports.OrderWorkerController = OrderWorkerController;
