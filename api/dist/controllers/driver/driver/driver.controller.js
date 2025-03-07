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
exports.RequestController = void 0;
<<<<<<< HEAD
const getDriverRequest_service_1 = require("../../../services/driver/getDriverRequest.service");
=======
const updateDriverRequest_service_1 = require("../../../services/driver/updateDriverRequest.service");
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
const getDriverHistory_service_1 = require("../../../services/driver/getDriverHistory.service");
class RequestController {
    updateRequestStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const driverId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { requestId, type } = req.body;
<<<<<<< HEAD
                const result = yield (0, getDriverRequest_service_1.updateRequestStatusService)({ driverId, requestId, type });
=======
                const result = yield (0, updateDriverRequest_service_1.updateRequestStatusService)({ driverId, requestId, type });
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
                res.status(200).json({
                    message: "status updated",
                    data: result,
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        });
    }
    getDriverHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const driverId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { type, sortBy, order, page, pageSize } = req.query;
                if (!driverId) {
                    res.status(400).json({ message: "Driver ID diperlukan" });
                }
                const driverHistory = yield (0, getDriverHistory_service_1.getDriverHistoryService)({
                    driverId: driverId,
                    sortBy: sortBy,
                    order: order,
                    type: type,
                    page: page ? parseInt(page) : 1,
                    pageSize: parseInt(pageSize),
                });
                res.status(200).send(driverHistory);
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        });
    }
}
exports.RequestController = RequestController;
<<<<<<< HEAD
=======
;
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
