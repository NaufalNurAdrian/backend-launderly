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
exports.getUsersIdService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getUsersIdService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                fullName: true,
                email: true,
                authProvider: true,
                avatar: true,
                isVerify: true,
                createdAt: true,
                isDelete: true,
                role: true,
                employee: true
            },
        });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ user });
    }
    catch (err) {
        console.log(err);
        res.status(400).send({ message: "An error occurred" });
    }
});
exports.getUsersIdService = getUsersIdService;
