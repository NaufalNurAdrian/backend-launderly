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
exports.requestResetPassword = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const requestResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }
        const user = yield prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        if (!user.password) {
            return res
                .status(400)
                .json({ message: "Cannot reset password for social login users!" });
        }
        // Buat token unik untuk reset password
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        // Simpan token ke database dengan expiry 1 jam
        yield prisma_1.default.user.update({
            where: { email },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: new Date(Date.now() + 3600000), // Token berlaku 1 jam
            },
        });
        // Kirim email dengan link reset password (gunakan nodemailer atau layanan email lainnya)
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const resetLink = `${process.env.BASE_URL_FE}/reset-password?token=${resetToken}`;
        yield transporter.sendMail({
            from: "admin",
            to: email,
            subject: "Reset Password Request",
            text: `Click the following link to reset your password: ${resetLink}`,
        });
        res.status(200).json({ message: "Reset password email has been sent!" });
    }
    catch (error) {
        console.error("Error requesting reset password:", error);
        res.status(500).json({ message: "An internal server error occurred!" });
    }
});
exports.requestResetPassword = requestResetPassword;
