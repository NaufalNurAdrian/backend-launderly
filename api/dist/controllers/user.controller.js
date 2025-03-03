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
exports.UserController = void 0;
const getUserById_service_1 = require("../services/user/getUserById.service");
const resetPassword_service_1 = require("../services/user/resetPassword.service");
const editAvatar_service_1 = require("../services/user/editAvatar.service");
const emailUpdate_service_1 = require("../services/user/emailUpdate.service");
const emailVerify_service_1 = require("../services/user/emailVerify.service");
const forgetRequestPassword_service_1 = require("../services/user/forgetRequestPassword.service");
const forgetConfirmPassword_service_1 = require("../services/user/forgetConfirmPassword.service");
const confirmOrder_service_1 = require("../services/user/confirmOrder.service");
class UserController {
    getUsersId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, getUserById_service_1.getUsersIdService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, resetPassword_service_1.resetPasswordUserService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    editAvatar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, editAvatar_service_1.editAvatarService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, emailUpdate_service_1.updateEmailService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, emailVerify_service_1.verifyEmailService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    requestForgetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, forgetRequestPassword_service_1.requestForgetPasswordService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    confirmForgetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, forgetConfirmPassword_service_1.confirmForgetPasswordService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    confirmOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, confirmOrder_service_1.confirmOrderService)(req, res);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.UserController = UserController;
