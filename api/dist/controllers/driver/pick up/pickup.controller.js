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
exports.PickupController = void 0;
const getPickupRequests_service_service_1 = require("../../../services/driver/getPickupRequests.service.service");
class PickupController {
    getPickupRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const driverId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { page, sortBy, order } = req.query;
                const pickupRequests = yield (0, getPickupRequests_service_service_1.getPickupRequestsService)({
                    driverId: driverId,
                    sortBy: sortBy,
                    order: order,
                    page: page ? parseInt(page) : 1,
                });
                res.status(200).send(pickupRequests);
            }
            catch (err) {
                res.status(400).send({ message: err.message });
            }
        });
    }
}
exports.PickupController = PickupController;
