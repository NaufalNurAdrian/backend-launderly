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
exports.requestForgetPasswordService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = require("../../libs/nodemailer");
const requestForgetPasswordService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        // Jangan beri tahu jika email tidak ditemukan
        if (!user || !user.password) {
            return res.status(200).json({ message: "If the email exists, a reset link will be sent." });
        }
        // Buat token unik
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = yield bcrypt_1.default.hash(resetToken, 10);
        // Simpan token di database
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: new Date(Date.now() + 3600000), // Token berlaku 1 jam
            },
        });
        // Buat link reset password
        const resetLink = `${process.env.BASE_URL_FE}/reset-password/${resetToken}`;
        // Baca template email
        const templatePath = path_1.default.join(__dirname, "../templates", "resetPassword.hbs");
        const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
        const compiledTemplate = handlebars_1.default.compile(templateSource);
        const html = compiledTemplate({ name: user.fullName, resetLink });
        // Kirim email dengan template
        yield nodemailer_1.transporter.sendMail({
            from: `"Admin" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: "Reset Your Password",
            html,
        });
        return res.status(200).json({ message: "If the email exists, a reset link will be sent." });
    }
    catch (error) {
        console.error("Error requesting reset password:", error);
        return res.status(500).json({ message: "An internal server error occurred!" });
    }
});
exports.requestForgetPasswordService = requestForgetPasswordService;
