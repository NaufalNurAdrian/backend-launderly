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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const register_service_1 = require("../services/auth/register.service");
const login_service_1 = require("../services/auth/login.service");
const verify_service_1 = require("../services/auth/verify.service");
const loginGoogle_service_1 = require("../services/auth/loginGoogle.service");
class AuthController {
    registerController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (0, register_service_1.registerService)(req, res, next);
            }
            catch (error) {
                next(error);
            }
        });
    }
    loginController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (0, login_service_1.loginService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (0, verify_service_1.verifyService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getGoogleTokenController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code } = req.body;
                const result = yield (0, loginGoogle_service_1.loginGoogleService)(code);
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
