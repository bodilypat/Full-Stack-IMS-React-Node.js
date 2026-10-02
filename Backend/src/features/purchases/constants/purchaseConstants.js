/* ************************************************************ */
/* File: #src/features/purchases/constants/purchaseConstants.js */
/* ************************************************************ */

const PURCHASE_STATUS = Object.freeze({
	DRAFT: 'draft',
	PENDING: 'pending',
	APPROVED: 'approved',
	ORDERED: 'ordered',
	PARTIALLY_RECEIVED: 'partially_received',
	RECEIVED: 'received',
	CANCELLED: 'cancelled',
});

const PURCHASE_PAYMENT_STATUS = Object.freeze({
	UNPAID: 'unpaid',
	PARTIALLY_PAID: 'partially_paid',
	PAID: 'paid',
	REFUNDED: 'refunded',
});

const PURCHASE_PAYMENT_METHOD = Object.freeze({
	CASH: 'cash',
	CARD: 'card',
	BANK_TRANSFER: 'bank_transfer',
	CHECK: 'check',
	CREDIT: 'credit',
});

const PURCHASE_DEFAULTS = Object.freeze({
	CURRENCY: 'USD',
	PAGE: 1,
	LIMIT: 20,
	SORT_BY: 'createdAt',
	SORT_ORDER: 'desc',
});

module.exports = {
	PURCHASE_STATUS,
	PURCHASE_PAYMENT_STATUS,
	PURCHASE_PAYMENT_METHOD,
	PURCHASE_DEFAULTS,
};

