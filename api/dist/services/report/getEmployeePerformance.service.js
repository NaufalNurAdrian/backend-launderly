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
exports.getEmployeePerformanceService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const date_fns_1 = require("date-fns");
const getEmployeePerformanceService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id, filterOutlet = "all", filterMonth, filterYear } = query;
        // Cek apakah user ada
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { id },
            select: { employee: { select: { outletId: true } }, role: true },
        });
        if (!existingUser)
            throw new Error("User not found!");
        // Definisi tipe `whereClause`
        const whereClause = {};
        // Outlet Admin hanya bisa melihat outletnya sendiri
        if (existingUser.role !== "SUPER_ADMIN") {
            whereClause.worker = {
                outletId: (_b = (_a = existingUser.employee) === null || _a === void 0 ? void 0 : _a.outletId) !== null && _b !== void 0 ? _b : undefined,
            };
        }
        else if (filterOutlet !== "all") {
            whereClause.worker = {
                outletId: Number(filterOutlet),
            };
        }
        // Gunakan bulan & tahun saat ini jika tidak diberikan
        const now = new Date();
        const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();
        const year = filterYear ? Number(filterYear) : now.getFullYear();
        // Filter berdasarkan tanggal jika ada
        if (filterMonth || filterYear) {
            whereClause.createdAt = {
                gte: (0, date_fns_1.startOfMonth)(new Date(year, month)),
                lte: (0, date_fns_1.endOfMonth)(new Date(year, month)),
            };
        }
        console.log("whereClause:", JSON.stringify(whereClause, null, 2));
        // Ambil data performa karyawan
        const employeePerformances = yield prisma_1.default.orderWorker.findMany({
            where: whereClause,
            include: {
                worker: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },
                        outlet: {
                            select: {
                                outletName: true,
                            },
                        },
                    },
                },
            },
        });
        // Hitung jumlah pekerjaan per karyawan
        const performanceMap = new Map();
        employeePerformances.forEach((record) => {
            var _a;
            const worker = record.worker;
            if (!worker || !worker.user)
                return;
            const userId = worker.user.id;
            if (!performanceMap.has(userId)) {
                performanceMap.set(userId, {
                    count: 0,
                    data: {
                        userId,
                        fullName: worker.user.fullName || "Unknown",
                        email: worker.user.email || "Unknown",
                        outlet: ((_a = worker.outlet) === null || _a === void 0 ? void 0 : _a.outletName) || "No Outlet",
                    },
                });
            }
            performanceMap.get(userId).count += 1;
        });
        // Konversi ke array
        const performanceReport = Array.from(performanceMap.values()).map((item) => (Object.assign(Object.assign({}, item.data), { taskCompleted: item.count })));
        return {
            message: "Successfully fetched employee performance",
            result: { performanceReport },
        };
    }
    catch (error) {
        console.error("Error fetching employee performance:", error);
        throw error;
    }
});
exports.getEmployeePerformanceService = getEmployeePerformanceService;
