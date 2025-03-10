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
exports.addEmployeeService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../prisma"));
const nodemailer_1 = require("../../libs/nodemailer");
const jsonwebtoken_1 = require("jsonwebtoken");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const addEmployeeService = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield prisma_1.default.user.findFirst({
            where: {
                OR: [{ email: data.email }, { fullName: data.fullName }],
            },
        });
        if (existingUser) {
            throw new Error("Email or fullName already exists");
        }
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(data.password, saltRounds);
        const user = yield prisma_1.default.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                password: hashedPassword,
                role: data.role,
            },
        });
        const employee = yield prisma_1.default.employee.create({
            data: {
                userId: user.id,
                outletId: Number(data.outletId),
                workShift: data.workShift,
                station: data.station,
            },
        });
        const payload = { id: employee.id, role: data.role };
        const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "60m" });
        const link = `${process.env.BASE_URL_FE}/verify/${token}`;
        const templatePath = path_1.default.join(__dirname, "../templates", "verify.hbs");
        const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
        const compiledTemplate = handlebars_1.default.compile(templateSource);
        const html = compiledTemplate({ username: req.body.username, link });
        yield nodemailer_1.transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: req.body.email,
            subject: "Registration Successful",
            html,
        });
        return { user, employee };
    }
    catch (error) {
        throw new Error(error.message || "Failed to add employee");
    }
});
exports.addEmployeeService = addEmployeeService;
