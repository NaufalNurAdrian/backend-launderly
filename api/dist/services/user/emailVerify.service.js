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
const verifyEmailService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.query.token;
        // Pastikan token adalah string
        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "Invalid verification token!" });
        }
        // Cek apakah token valid
        const user = yield prisma_1.default.user.findFirst({
            where: { emailVerifyToken: token },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token!" });
        }
        // Update status email menjadi verified
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                isVerify: true,
                emailVerifyToken: null,
            },
        });
        res.status(200).json({ message: "Email verified successfully!" });
    }
    catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.verifyEmailService = verifyEmailService;
