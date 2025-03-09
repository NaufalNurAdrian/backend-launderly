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
exports.PickupOrderController = void 0;
const createPickupOrder_service_1 = require("../services/pickupOrder/createPickupOrder.service");
const getPickupOrders_service_1 = require("../services/pickupOrder/getPickupOrders.service");
const updatePickupOrder_service_1 = require("../services/pickupOrder/updatePickupOrder.service");
const getNearbyOutletservice_1 = require("../services/pickupOrder/getNearbyOutletservice");
const getUserOrder_service_1 = require("../services/pickupOrder/getUserOrder.service");
class PickupOrderController {
    getPickupOrdersController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const query = {
                    id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    pickupStatus: req.query.pickupStatus || "all",
                    isOrderCreated: Number(req.query.isOrderCreated) || 0,
                    isClaimedbyDriver: Number(req.query.isClaimedbyDriver) || 0,
                    latitude: req.query.latitude ? Number(req.query.latitude) : undefined,
                    longitude: req.query.longitude
                        ? Number(req.query.longitude)
                        : undefined,
                    take: Number(req.query.take) || 10,
                    page: Number(req.query.page) || 1,
                    sortBy: req.query.sortBy || "createdAt",
                    sortOrder: req.query.sortOrder === "desc" ? "desc" : "asc",
                };
                const result = yield (0, getPickupOrders_service_1.getPickupOrdersService)(query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserOrdersController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const orders = yield (0, getUserOrder_service_1.getUserOrdersService)(userId);
                res.json({ data: orders });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updatePickupOrderController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, updatePickupOrder_service_1.updatePickupOrderService)(req.body);
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    createPickupOrderController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, createPickupOrder_service_1.createOrderPickupOrderService)(req.body);
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    getOutletNearbyController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { latitude, longitude } = req.query;
                if (!latitude || !longitude) {
                    res
                        .status(400)
                        .json({ message: "Latitude and longitude are required" });
                    return;
                }
                // Pastikan nilai query string diubah ke number
                const lat = Number(latitude);
                const lon = Number(longitude);
                if (isNaN(lat) || isNaN(lon)) {
                    res
                        .status(400)
                        .json({ message: "Invalid latitude or longitude format" });
                    return;
                }
                // Panggil service yang telah diperbaiki
                const result = yield (0, getNearbyOutletservice_1.getNearbyOutletsService)(lat, lon);
                res.status(200).json({
                    message: "Nearby outlets retrieved successfully",
                    nearbyOutlets: result,
                });
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.PickupOrderController = PickupOrderController;
