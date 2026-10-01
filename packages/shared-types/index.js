const OrderStatus = {
  PENDING: "PENDING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

const PaymentStatus = {
  UNPAID: "UNPAID",
  PAID_ONLINE: "PAID_ONLINE",
  COLLECTED: "COLLECTED"
};

const TripStatus = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED"
};

module.exports = {
  OrderStatus,
  PaymentStatus,
  TripStatus
};
