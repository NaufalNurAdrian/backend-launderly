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
            res.status(400).send({ message: "Email and password are required" });
            return;
        }
        const { email, password } = req.body;
        const customer = yield prisma_1.default.user.findFirst({
            where: { email },
        });
        if (!customer)
            throw { message: "Customer account not found!" };
        const isValidPass = yield bcrypt_1.default.compare(password, customer.password);
        if (!isValidPass)
            throw { message: "Incorrect Password!" };
        if (!customer.isVerify)
            throw {
                message: "Your account is not verified. Please verify your account before logging in.",
            };
        // Create JWT token for the customer
        const payload = {
            id: customer.id,
            role: customer.role,
            authProvider: "email"
        };
        const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "1d" });
        console.log("Generated Token:", token);
        res
            .status(200)
            .send({ message: "Login Successfully", customer, token });
    }
    catch (err) {
        console.error("Error during login:", err);
        res.status(400).send(err);
    }
});
exports.loginService = loginService;
