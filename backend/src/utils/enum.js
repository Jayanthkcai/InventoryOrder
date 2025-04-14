const orderStatus = Object.freeze({
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  ORDERRESERVED: "ORDERRESERVED",
  OUTOFSTOCK: "OUTSTOCK",
  INVALIDSTOCK: "INVALIDSTOCK",
});

function isValidOrderStatus(status) {
  return Object.values(orderStatus).includes(status);
}
export default orderStatus;
