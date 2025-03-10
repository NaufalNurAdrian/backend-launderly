"use strict";
// import { PrismaClient } from "../prisma/generated/client";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
exports.default = new client_1.PrismaClient({ log: ["query", "info", "warn", "error"] });
