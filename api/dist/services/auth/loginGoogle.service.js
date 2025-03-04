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
exports.loginGoogleService = void 0;
const google_auth_library_1 = require("google-auth-library");
const prisma_1 = __importDefault(require("../../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../../utils/config");
const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.CLIENT_ID);
const loginGoogleService = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifikasi ID Token langsung
        const ticket = yield oAuth2Client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error("Invalid token payload");
        }
        const userData = {
            email: payload.email,
            name: payload.name || "",
            picture: payload.picture || "",
        };
        // Cek apakah user sudah ada di database
        let existingUser = yield prisma_1.default.user.findFirst({
            where: { email: userData.email },
        });
        if (existingUser) {
            // Jika user sudah ada tetapi menggunakan email/password, update authProvider ke Google
            if (existingUser.authProvider !== "google") {
                existingUser = yield prisma_1.default.user.update({
                    where: { email: userData.email },
                    data: { authProvider: "google" },
                });
            }
            // Generate token dengan authProvider yang benar
            const token = (0, jsonwebtoken_1.sign)({ id: existingUser.id, authProvider: "google" }, config_1.appConfig.jwtSecretKey, {
                expiresIn: "2h",
            });
            return {
                message: "Login by Google Success",
                data: existingUser,
                token,
            };
        }
        // Jika user belum ada, buat user baru
        const newUser = yield prisma_1.default.user.create({
            data: {
                email: userData.email,
                fullName: userData.name,
                avatar: userData.picture,
                isVerify: true,
                authProvider: "google",
            },
        });
        const token = (0, jsonwebtoken_1.sign)({ id: newUser.id, authProvider: "google" }, config_1.appConfig.jwtSecretKey, {
            expiresIn: "2h",
        });
        return {
            message: "Login by Google Success ✅",
            data: newUser,
            token,
        };
    }
    catch (error) {
        console.error("Google Login Error:", error);
        throw new Error("Google login failed. Please try again.");
    }
});
exports.loginGoogleService = loginGoogleService;
