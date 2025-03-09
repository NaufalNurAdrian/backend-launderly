import { DeliveryStatus, PickupStatus } from "../../prisma/generated/client";

export const getNextStatus = (
  type: "pickup" | "delivery",
  currentStatus: PickupStatus | DeliveryStatus
) => {
  const statusFlow: Record<
    "pickup" | "delivery",
    Partial<
      Record<PickupStatus | DeliveryStatus, PickupStatus | DeliveryStatus>
    >
  > = {
    pickup: {
      [PickupStatus.WAITING_FOR_DRIVER]: PickupStatus.ON_THE_WAY_TO_CUSTOMER,
      [PickupStatus.ON_THE_WAY_TO_CUSTOMER]: PickupStatus.ON_THE_WAY_TO_OUTLET,
      [PickupStatus.ON_THE_WAY_TO_OUTLET]: PickupStatus.RECEIVED_BY_OUTLET,
    },
    delivery: {
      [DeliveryStatus.WAITING_FOR_DRIVER]: DeliveryStatus.ON_THE_WAY_TO_OUTLET,
      [DeliveryStatus.ON_THE_WAY_TO_OUTLET]:
        DeliveryStatus.ON_THE_WAY_TO_CUSTOMER,
      [DeliveryStatus.ON_THE_WAY_TO_CUSTOMER]:
        DeliveryStatus.RECEIVED_BY_CUSTOMER,
    },
  };

  const nextStatus = statusFlow[type]?.[currentStatus];

  if (!nextStatus) {
    throw new Error(`${type} request finished or has invalid status`);
  }

  return nextStatus;
};
