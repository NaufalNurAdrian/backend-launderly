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
exports.loginService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const loginService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Request Body:", req.body);
        // Validasi input
        if (!req.body || !req.body.email || !req.body.password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const { email, password } = req.body;
        // Cari user berdasarkan email
        const customer = yield prisma_1.default.user.findFirst({
            where: { email },
        });
        // Jika user tidak ditemukan
        if (!customer) {
            throw new Error("Customer account not found!");
        }
        // Jika user terdaftar dengan Google (tanpa password)
        if (!customer.password) {
            throw new Error("This email is registered via Google. Please log in using Google.");
        }
        // Validasi password
        const isValidPass = yield bcrypt_1.default.compare(password, customer.password);
        if (!isValidPass) {
            throw new Error("Incorrect Password!");
        }
        // Jika akun belum diverifikasi
        if (!customer.isVerify) {
            throw new Error("Your account is not verified. Please verify your account before logging in.");
        }
        // Buat token JWT untuk user
        const payload = {
            id: customer.id,
            role: customer.role,
            authProvider: "email",
        };
        const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "1d" });
        console.log("Generated Token:", token);
        res.status(200).json({ message: "Login Successfully", customer, token });
    }
    catch (err) {
        console.error("Error during login:", err);
        // Tangani error dengan aman di TypeScript
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        }
        else {
            res.status(400).json({ message: "Something went wrong" });
        }
    }
});
exports.loginService = loginService;
