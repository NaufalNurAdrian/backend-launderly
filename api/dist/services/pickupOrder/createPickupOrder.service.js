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
exports.createOrderPickupOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createOrderPickupOrderService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
<<<<<<< HEAD
        const { outletId, userAddressId, userId, distance, pickupPrice = 5000 } = body;
=======
        const { outletId, userAddressId, userId, distance, pickupPrice = 2500 } = body;
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { id: userId },
            select: { id: true },
        });
        if (!existingUser) {
            throw new Error("User Not Found!");
        }
        const padNumber = (num, size) => {
            let s = num.toString();
            while (s.length < size)
                s = "0" + s;
            return s;
        };
        const getNextNumber = (lastReferenceNumber) => {
            if (!lastReferenceNumber) {
                return padNumber(1, 4);
            }
            const numberParts = lastReferenceNumber.split("-");
            const lastPart = numberParts.pop();
            if (!lastPart) {
                throw new Error("Invalid number format");
            }
            const lastNumber = parseInt(lastPart, 10);
            if (isNaN(lastNumber)) {
                throw new Error("Last part of the number is not a valid number");
            }
            return padNumber(lastNumber + 1, 4);
        };
        const lastPickupNumber = yield prisma_1.default.pickupOrder.findFirst({
            where: {
                pickupNumber: {
                    contains: `PO-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-`,
                },
            },
            orderBy: {
                pickupNumber: "desc",
            },
        });
        const nextPickupNumber = getNextNumber(lastPickupNumber === null || lastPickupNumber === void 0 ? void 0 : lastPickupNumber.pickupNumber);
        const pickupNumber = `PO-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-${nextPickupNumber}`;
        const lastOrderNumber = yield prisma_1.default.order.findFirst({
            where: {
                orderNumber: {
                    contains: `OR-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-`,
                },
            },
            orderBy: {
                orderNumber: "desc",
            },
        });
        const nextOrderNumber = getNextNumber(lastOrderNumber === null || lastOrderNumber === void 0 ? void 0 : lastOrderNumber.orderNumber);
        const orderNumber = `OR-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-${nextOrderNumber}`;
        const lastDeliveryNumber = yield prisma_1.default.deliveryOrder.findFirst({
            where: {
                deliveryNumber: {
                    contains: `DO-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-`,
                },
            },
            orderBy: {
                deliveryNumber: "desc",
            },
        });
        const nextDeliveryNumber = getNextNumber(lastDeliveryNumber === null || lastDeliveryNumber === void 0 ? void 0 : lastDeliveryNumber.deliveryNumber);
        const deliveryNumber = `DO-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-${nextDeliveryNumber}`;
        const newPickup = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const createPickupOrder = yield tx.pickupOrder.create({
                data: {
                    pickupNumber: pickupNumber,
                    outletId: outletId,
                    userId: userId,
                    addressId: userAddressId,
                    distance: distance,
                    pickupPrice: pickupPrice,
                },
            });
            const createOrder = yield tx.order.create({
                data: {
                    orderNumber: orderNumber,
                    pickupOrderId: createPickupOrder.id,
                },
            });
            const createDeliveryOrder = yield tx.deliveryOrder.create({
                data: {
                    deliveryNumber: deliveryNumber,
                    orderId: createOrder.id,
                    userId: userId,
                    addressId: userAddressId,
                    distance: distance,
                    deliveryPrice: pickupPrice,
                },
            });
            const createNotification = yield tx.notification.create({
                data: {
                    title: "Incoming Pickup Order",
                    description: "New pickup request at your outlet",
                },
            });
            const getUserId = yield tx.employee.findMany({
                where: {
                    outletId: outletId,
                    workShift: null,
                    station: null,
                },
                select: { userId: true },
            });
            const userIds = getUserId.map((user) => user.userId);
            const createUserNotification = yield Promise.all(userIds.map((userId) => __awaiter(void 0, void 0, void 0, function* () {
                yield tx.userNotification.create({
                    data: {
                        notificationId: createNotification.id,
                        userId: userId,
                    },
                });
            })));
            return {
                pickupOrder: createPickupOrder,
                order: createOrder,
                deliveryOrder: createDeliveryOrder,
                userNotification: createUserNotification,
            };
        }));
        return newPickup;
    }
    catch (error) {
        throw error;
    }
});
exports.createOrderPickupOrderService = createOrderPickupOrderService;
