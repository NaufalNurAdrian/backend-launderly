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
exports.AddressController = void 0;
const getAdressById_service_1 = require("../services/address/getAdressById.service");
const updateAdressUser_service_1 = require("../services/address/updateAdressUser.service");
const createAddressUser_service_1 = require("../services/address/createAddressUser.service");
const deleteAddressUser_service_1 = require("../services/address/deleteAddressUser.service");
const getUserAdress_service_1 = require("../services/address/getUserAdress.service");
const getOutletAddres_service_1 = require("../services/address/getOutletAddres.service");
class AddressController {
    getUserAddressController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, getUserAdress_service_1.getUserAddressesService)(req);
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAddressById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield (0, getAdressById_service_1.getAddressByIdService)(Number(id));
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    getOutletAddress(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, getOutletAddres_service_1.getAllOutletsService)();
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateUserAddressController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield (0, updateAdressUser_service_1.updateUserAddressService)(Number(id), req.body);
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    createUserAddressController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, createAddressUser_service_1.createUserAddressService)(req, res);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteUserAddressController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield (0, deleteAddressUser_service_1.deleteUserAddressService)(Number(id));
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AddressController = AddressController;
