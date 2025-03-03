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
exports.registerService = void 0;
const register_service_1 = require("../../libs/register.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = require("../../libs/nodemailer");
const handlebars_1 = __importDefault(require("handlebars"));
const registerService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, email, password } = req.body;
        // Validate input
        if (!fullName || !email || !password) {
            res.status(400).send({ message: "All fields are required" });
            return;
        }
        // Check if customer already exists
        const existingCustomer = yield (0, register_service_1.findCust)(email);
        if (existingCustomer) {
            res.status(400).send({ message: "Email already exists" });
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create the new customer
        const customer = yield prisma_1.default.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
            },
        });
        // Generate verification token
        const payload = { id: customer.id, role: "customer" };
        const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "60m" });
        const link = `${process.env.BASE_URL_FE}/verify/${token}`;
        // Prepare and send the email
        const templatePath = path_1.default.join(__dirname, "../templates", "verify.hbs");
        const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
        const compiledTemplate = handlebars_1.default.compile(templateSource);
        const html = compiledTemplate({ username: req.body.username, link });
        yield nodemailer_1.transporter.sendMail({
            from: "Admin",
            to: req.body.email,
            subject: "Registration Successful",
            html,
        });
        res.status(201).send({
            message: "Customer created successfully. Please check your email for verification.",
            customer,
        });
    }
    catch (err) {
        console.error("Error during registration:", err);
        res
            .status(500)
            .send({ message: "An error occurred during registration", error: err });
    }
});
exports.registerService = registerService;
