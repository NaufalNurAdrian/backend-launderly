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
exports.editAvatarService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const cloudinary_1 = require("../../utils/cloudinary");
const editAvatarService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("Received file:", req.file);
    try {
        if (!req.file)
            throw { message: "Avatar not found !" };
        const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "avatarLogin");
        yield prisma_1.default.user.update({
            where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
            data: { avatar: secure_url },
        });
        res.status(200).send({ message: "Avatar edited !" });
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});
exports.editAvatarService = editAvatarService;
