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
exports.resetPasswordUserService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const resetPasswordUserService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
            res.status(400).send({ message: "All fields are required!" });
            return;
        }
        if (password !== confirmPassword) {
            res.status(400).send({ message: "Passwords do not match!" });
            return;
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).send({ message: "Unauthorized request!" });
            return;
        }
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).send({ message: "User not found!" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        res.status(200).send({ message: "Password has been reset successfully!" });
    }
    catch (err) {
        console.error("Error resetting password:", err);
        res.status(500).send({ message: "An internal server error occurred!" });
    }
});
exports.resetPasswordUserService = resetPasswordUserService;
