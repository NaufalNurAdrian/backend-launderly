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
exports.DeliveryController = void 0;
const getDeliveryRequests_service_1 = require("../../../services/driver/getDeliveryRequests.service");
class DeliveryController {
    getDeliveryRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const driverId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { page, sortBy, order } = req.query;
                if (!driverId) {
                    res.status(400).json({ message: "Driver ID diperlukan" });
                }
                const deliveryRequests = yield (0, getDeliveryRequests_service_1.getDeliveryRequestsService)({
                    driverId: driverId,
                    sortBy: sortBy,
                    order: order,
                    page: page ? parseInt(page) : 1,
                });
                res.status(200).send(deliveryRequests);
            }
            catch (err) {
                console.log(err);
                res.status(400).send({ message: err.message });
            }
        });
    }
}
exports.DeliveryController = DeliveryController;
