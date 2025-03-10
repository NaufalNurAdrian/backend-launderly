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
exports.verifyService = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = __importDefault(require("../../prisma"));
const verifyService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const verifiedCustomer = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
        yield prisma_1.default.user.update({
            data: { isVerify: true },
            where: { id: verifiedCustomer.id },
        });
        res.status(200).send({ message: "Customer verified successfully" });
    }
    catch (err) {
        console.error("Error verifying customer:", err);
        res.status(400).send({
            message: "Invalid token or verification failed",
            error: err.message,
        });
    }
});
exports.verifyService = verifyService;
