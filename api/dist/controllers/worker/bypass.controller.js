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
exports.BypassController = void 0;
const createBypass_service_1 = require("../../services/worker/bypass/createBypass.service");
class BypassController {
    requestBypass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { orderId } = req.params;
                const { bypassNote } = req.body;
                const result = yield (0, createBypass_service_1.createBypass)({
                    workerId: workerId,
                    orderId: parseInt(orderId),
                    bypassNote: bypassNote,
                });
                res.status(200).send({ message: "bypass requested", data: result });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
    }
}
exports.BypassController = BypassController;
