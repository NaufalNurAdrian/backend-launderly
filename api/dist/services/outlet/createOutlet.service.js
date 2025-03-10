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
exports.createOutletService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createOutletService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { outletName, outletType, address } = data;
        const existingOutletName = yield prisma_1.default.outlet.findFirst({
            where: { outletName },
        });
        if (existingOutletName) {
            throw new Error("Outlet name already exists!");
        }
        const newOutlet = yield prisma_1.default.outlet.create({
            data: {
                outletName: outletName,
                outletType: outletType,
                address: {
                    create: address,
                },
            },
        });
        return newOutlet;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.createOutletService = createOutletService;
