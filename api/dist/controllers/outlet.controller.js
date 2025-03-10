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
exports.OutletController = void 0;
const createOutlet_service_1 = require("../services/outlet/createOutlet.service");
const getAllOutlet_service_1 = require("../services/outlet/getAllOutlet.service");
const getOutletById_service_1 = require("../services/outlet/getOutletById.service");
const updateOutlet_service_1 = require("../services/outlet/updateOutlet.service");
const deleteOutlet_service_1 = require("../services/outlet/deleteOutlet.service");
class OutletController {
    createOutletController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, createOutlet_service_1.createOutletService)(req.body);
                res.status(201).send({ message: "Outlet created successfully", result });
            }
            catch (error) {
                res.status(500).send({ message: error.message });
            }
        });
    }
    getAllOutlet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { outlets, totalCount } = yield (0, getAllOutlet_service_1.getAllOutletService)(page, limit);
                res.status(200).send({
                    message: "Successfully fetched outlets",
                    outlets: outlets !== null && outlets !== void 0 ? outlets : [],
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    currentPage: page,
                });
            }
            catch (error) {
                res.status(500).send({ message: "Failed to get outlets" });
            }
        });
    }
    getOutletById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id) {
                    res.status(400).send({ message: "Outlet ID is required" });
                }
                const outlet = yield (0, getOutletById_service_1.getOutletByIdService)(id);
                if (!outlet) {
                    res.status(404).send({ message: "Outlet not found" });
                }
                res
                    .status(200)
                    .send({ message: "Outlet retrieved successfully", outlet });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: error.message || "Cannot retrieve outlet" });
            }
        });
    }
    updateOutlet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.body.id;
                if (!id) {
                    res.status(400).send({ message: "Outlet ID is required" });
                }
                const result = yield (0, updateOutlet_service_1.updateOutletService)(req.body);
                console.log("Data yang diterima di backend:", req.body);
                res.status(200).send({ message: "Outlet updated successfully", result });
            }
            catch (error) {
                res.status(500).send({ message: error.message || "Cannot update outlet" });
            }
        });
    }
    deleteOutlet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.body.id;
                if (!id) {
                    res.status(400).send({ message: "Outlet ID is required" });
                }
                const outletId = parseInt(id);
                const result = yield (0, deleteOutlet_service_1.deleteOutletService)(outletId);
                res.status(200).send({ message: "Outlet deleted successfully", result });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: error.message || "Cannot delete outlet" });
            }
        });
    }
}
exports.OutletController = OutletController;
