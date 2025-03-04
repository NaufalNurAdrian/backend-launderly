"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextStatus = void 0;
const client_1 = require("prisma/generated/client");
const getNextStatus = (type, currentStatus) => {
    var _a;
    const statusFlow = {
        pickup: {
            [client_1.PickupStatus.WAITING_FOR_DRIVER]: client_1.PickupStatus.ON_THE_WAY_TO_CUSTOMER,
            [client_1.PickupStatus.ON_THE_WAY_TO_CUSTOMER]: client_1.PickupStatus.ON_THE_WAY_TO_OUTLET,
            [client_1.PickupStatus.ON_THE_WAY_TO_OUTLET]: client_1.PickupStatus.RECEIVED_BY_OUTLET,
        },
        delivery: {
            [client_1.DeliveryStatus.WAITING_FOR_DRIVER]: client_1.DeliveryStatus.ON_THE_WAY_TO_OUTLET,
            [client_1.DeliveryStatus.ON_THE_WAY_TO_OUTLET]: client_1.DeliveryStatus.ON_THE_WAY_TO_CUSTOMER,
            [client_1.DeliveryStatus.ON_THE_WAY_TO_CUSTOMER]: client_1.DeliveryStatus.RECEIVED_BY_CUSTOMER,
        },
    };
    const nextStatus = (_a = statusFlow[type]) === null || _a === void 0 ? void 0 : _a[currentStatus];
    if (!nextStatus) {
        throw new Error(`${type} request finished or has invalid status`);
    }
    return nextStatus;
};
exports.getNextStatus = getNextStatus;
