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
exports.verifyEmailService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const verifyEmailService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Verification token is required!" });
        }
        // Verifikasi token JWT
        let decoded;
        try {
            decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
        }
        catch (error) {
            return res.status(400).json({ message: "Invalid or expired token!" });
        }
        const { id, newEmail } = decoded;
        // Konversi ID ke number
        const userId = Number(id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID!" });
        }
        // Cari user berdasarkan token yang dikirim di params
        const user = yield prisma_1.default.user.findFirst({
            where: { emailVerifyToken: token },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token!" });
        }
        // Cek apakah email baru masih tersedia
        const existingUser = yield prisma_1.default.user.findUnique({ where: { email: newEmail } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use!" });
        }
        // Update email dan hapus token verifikasi
        yield prisma_1.default.user.update({
            where: { id: userId },
            data: {
                email: newEmail,
                emailVerifyToken: null,
            },
        });
        res.status(200).json({ message: "Email verified and updated successfully!" });
    }
    catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ message: "An internal server error occurred!" });
    }
});
exports.verifyEmailService = verifyEmailService;
