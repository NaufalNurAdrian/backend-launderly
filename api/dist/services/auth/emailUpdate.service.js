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
exports.updateEmail = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = require("../../libs/nodemailer");
const updateEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Dapatkan user ID dari JWT
        const { newEmail } = req.body;
        if (!newEmail) {
            return res.status(400).json({ message: "New email is required!" });
        }
        // Cek apakah email sudah digunakan oleh user lain
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { email: newEmail },
        });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use!" });
        }
        // Generate verification token
        const payload = { id: userId, newEmail };
        const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "10m" });
        const link = `${process.env.BASE_URL_FE}/verify-email/${token}`;
        // Baca template email
        const templatePath = path_1.default.join(__dirname, "../templates", "verifyEmail.hbs");
        const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
        const compiledTemplate = handlebars_1.default.compile(templateSource);
        const html = compiledTemplate({ link });
        // Kirim email verifikasi dengan Nodemailer
        yield nodemailer_1.transporter.sendMail({
            from: "Admin",
            to: newEmail,
            subject: "Verify Your New Email",
            html,
        });
        // Simpan token ke database (opsional)
        yield prisma_1.default.user.update({
            where: { id: userId },
            data: {
                emailVerifyToken: token,
                isVerify: false, // Email harus diverifikasi ulang
            },
        });
        res.status(200).json({
            message: "Email update requested. Please verify your new email address.",
        });
    }
    catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateEmail = updateEmail;
