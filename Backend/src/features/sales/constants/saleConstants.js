/* File: #src/features/sales/constants/saleConstants.js
** sale constants
** - SALE_STATUS
** - PAYMENT_STATUS
** - PAYMENT_METHODS
** - TAX_RATES
*/

const SALE_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PARTIALLY_PAID: "partially_paid",
  OVERPAID: "overpaid",
};

const PAYMENT_METHODS = [
  "cash",
  "card",
  "bank_transfer",
  "credit",
  "mobile_money",
  "other"
];

const TAX_RATES = {
  STANDARD: 0.18,
  REDUCED: 0.09,
  ZERO: 0,
};

