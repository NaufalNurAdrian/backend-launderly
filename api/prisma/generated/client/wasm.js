
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.4.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.4.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  fullName: 'fullName',
  email: 'email',
  password: 'password',
  isVerify: 'isVerify',
  role: 'role',
  avatar: 'avatar',
  createdAt: 'createdAt',
  isDelete: 'isDelete',
  resetPasswordToken: 'resetPasswordToken',
  resetPasswordExpires: 'resetPasswordExpires',
  emailVerifyToken: 'emailVerifyToken',
  authProvider: 'authProvider'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  workShift: 'workShift',
  isSuperAdmin: 'isSuperAdmin',
  station: 'station',
  userId: 'userId',
  outletId: 'outletId'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  addressLine: 'addressLine',
  city: 'city',
  isPrimary: 'isPrimary',
  latitude: 'latitude',
  longitude: 'longitude',
  isDelete: 'isDelete',
  outletId: 'outletId',
  userId: 'userId'
};

exports.Prisma.OutletScalarFieldEnum = {
  id: 'id',
  outletName: 'outletName',
  outletType: 'outletType',
  createdAt: 'createdAt',
  deletedAt: 'deletedAt',
  updatedAt: 'updatedAt',
  isDelete: 'isDelete'
};

exports.Prisma.PickupOrderScalarFieldEnum = {
  id: 'id',
  pickupNumber: 'pickupNumber',
  pickupStatus: 'pickupStatus',
  distance: 'distance',
  pickupPrice: 'pickupPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isOrderCreated: 'isOrderCreated',
  userId: 'userId',
  outletId: 'outletId',
  driverId: 'driverId',
  addressId: 'addressId'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  orderStatus: 'orderStatus',
  weight: 'weight',
  laundryPrice: 'laundryPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  pickupOrderId: 'pickupOrderId',
  isPaid: 'isPaid',
  isConfirm: 'isConfirm',
  receivedAt: 'receivedAt',
  confirmedAt: 'confirmedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  qty: 'qty',
  orderId: 'orderId',
  laundryItemId: 'laundryItemId',
  isDelete: 'isDelete'
};

exports.Prisma.LaundryItemScalarFieldEnum = {
  id: 'id',
  itemName: 'itemName',
  isDelete: 'isDelete'
};

exports.Prisma.DeliveryOrderScalarFieldEnum = {
  id: 'id',
  deliveryNumber: 'deliveryNumber',
  deliveryStatus: 'deliveryStatus',
  distance: 'distance',
  deliveryPrice: 'deliveryPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  driverId: 'driverId',
  orderId: 'orderId',
  addressId: 'addressId'
};

exports.Prisma.OrderWorkerScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  workerId: 'workerId',
  station: 'station',
  isComplete: 'isComplete',
  bypassRequest: 'bypassRequest',
  bypassNote: 'bypassNote',
  bypassAccepted: 'bypassAccepted',
  bypassRejected: 'bypassRejected',
  createdAt: 'createdAt'
};

exports.Prisma.UserNotificationScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isRead: 'isRead',
  userId: 'userId',
  notificationId: 'notificationId'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  invoiceNumber: 'invoiceNumber',
  amount: 'amount',
  paymentMethode: 'paymentMethode',
  paymentStatus: 'paymentStatus',
  snapToken: 'snapToken',
  snapRedirectUrl: 'snapRedirectUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  orderId: 'orderId'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  checkIn: 'checkIn',
  checkOut: 'checkOut',
  createdAt: 'createdAt',
  workHour: 'workHour',
  userId: 'userId',
  attendanceStatus: 'attendanceStatus'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OUTLET_ADMIN: 'OUTLET_ADMIN',
  WORKER: 'WORKER',
  DRIVER: 'DRIVER',
  CUSTOMER: 'CUSTOMER'
};

exports.EmployeeWorkShift = exports.$Enums.EmployeeWorkShift = {
  DAY: 'DAY',
  NIGHT: 'NIGHT'
};

exports.EmployeeStation = exports.$Enums.EmployeeStation = {
  WASHING: 'WASHING',
  IRONING: 'IRONING',
  PACKING: 'PACKING'
};

exports.OutletType = exports.$Enums.OutletType = {
  MAIN: 'MAIN',
  BRANCH: 'BRANCH'
};

exports.PickupStatus = exports.$Enums.PickupStatus = {
  WAITING_FOR_DRIVER: 'WAITING_FOR_DRIVER',
  ON_THE_WAY_TO_CUSTOMER: 'ON_THE_WAY_TO_CUSTOMER',
  ON_THE_WAY_TO_OUTLET: 'ON_THE_WAY_TO_OUTLET',
  RECEIVED_BY_OUTLET: 'RECEIVED_BY_OUTLET'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  WAITING_FOR_PICKUP_DRIVER: 'WAITING_FOR_PICKUP_DRIVER',
  ON_THE_WAY_TO_CUSTOMER: 'ON_THE_WAY_TO_CUSTOMER',
  ON_THE_WAY_TO_OUTLET: 'ON_THE_WAY_TO_OUTLET',
  ARRIVED_AT_OUTLET: 'ARRIVED_AT_OUTLET',
  READY_FOR_WASHING: 'READY_FOR_WASHING',
  BEING_WASHED: 'BEING_WASHED',
  WASHING_COMPLETED: 'WASHING_COMPLETED',
  BEING_IRONED: 'BEING_IRONED',
  IRONING_COMPLETED: 'IRONING_COMPLETED',
  BEING_PACKED: 'BEING_PACKED',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY',
  WAITING_FOR_DELIVERY_DRIVER: 'WAITING_FOR_DELIVERY_DRIVER',
  BEING_DELIVERED_TO_CUSTOMER: 'BEING_DELIVERED_TO_CUSTOMER',
  RECEIVED_BY_CUSTOMER: 'RECEIVED_BY_CUSTOMER',
  COMPLETED: 'COMPLETED'
};

exports.DeliveryStatus = exports.$Enums.DeliveryStatus = {
  NOT_READY_TO_DELIVER: 'NOT_READY_TO_DELIVER',
  WAITING_FOR_DRIVER: 'WAITING_FOR_DRIVER',
  ON_THE_WAY_TO_OUTLET: 'ON_THE_WAY_TO_OUTLET',
  ON_THE_WAY_TO_CUSTOMER: 'ON_THE_WAY_TO_CUSTOMER',
  RECEIVED_BY_CUSTOMER: 'RECEIVED_BY_CUSTOMER'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  SUCCESSED: 'SUCCESSED',
  CANCELLED: 'CANCELLED',
  DENIED: 'DENIED',
  EXPIRED: 'EXPIRED',
  PENDING: 'PENDING'
};

exports.AttendanceStatus = exports.$Enums.AttendanceStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.Prisma.ModelName = {
  User: 'User',
  Employee: 'Employee',
  Address: 'Address',
  Outlet: 'Outlet',
  PickupOrder: 'PickupOrder',
  Order: 'Order',
  OrderItem: 'OrderItem',
  LaundryItem: 'LaundryItem',
  DeliveryOrder: 'DeliveryOrder',
  OrderWorker: 'OrderWorker',
  UserNotification: 'UserNotification',
  Notification: 'Notification',
  Payment: 'Payment',
  Attendance: 'Attendance'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
