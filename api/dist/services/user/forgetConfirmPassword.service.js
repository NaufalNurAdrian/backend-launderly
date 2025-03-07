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
exports.confirmForgetPasswordService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const confirmForgetPasswordService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match!" });
        }
        // Cari user dengan token valid
        const users = yield prisma_1.default.user.findMany({
            where: {
                resetPasswordExpires: { gte: new Date() },
            },
        });
        let user = null;
        for (const u of users) {
            if (yield bcrypt_1.default.compare(token, u.resetPasswordToken)) {
                user = u;
                break;
            }
        }
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token!" });
        }
        // Hash password baru
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update password dalam transaksi agar aman
        yield prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                },
            }),
        ]);
        return res.status(200).json({ message: "Password has been reset successfully!" });
    }
    catch (error) {
        console.error("Error confirming reset password:", error);
        return res.status(500).json({ message: "An internal server error occurred!" });
    }
});
exports.confirmForgetPasswordService = confirmForgetPasswordService;
