/* File: #src/features/sales/services/paymentService.js
** Business logic for payments.
**  - createPayment()
**  - getPayments()
**  - getPaymentById()
**  - updatePayment()
**  - deletePayment()
 */

const Payment = require("../models/paymentModel");

function notFoundError(id) {
	const error = new Error(`Payment not found: ${id}`);
	error.statusCode = 404;
	return error;
}

async function createPayment(paymentData) {
	if (!paymentData || typeof paymentData !== "object" || Array.isArray(paymentData)) {
		const error = new Error("Payment data must be an object");
		error.statusCode = 400;
		throw error;
	}

	return Payment.create(paymentData);
}

async function getPayments(filters = {}) {
	return Payment.find(filters).sort({ createdAt: -1 });
}

async function getPaymentById(id) {
	const payment = await Payment.findById(id);
	if (!payment) throw notFoundError(id);
	return payment;
}

async function updatePayment(id, updates) {
	if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
		const error = new Error("Payment updates must be an object");
		error.statusCode = 400;
		throw error;
	}

	const payment = await Payment.findByIdAndUpdate(id, updates, {
		new: true,
		runValidators: true,
	});
	if (!payment) throw notFoundError(id);
	return payment;
}

async function deletePayment(id) {
	const payment = await Payment.findByIdAndDelete(id);
	if (!payment) throw notFoundError(id);
	return payment;
}

module.exports = {
	createPayment,
	getPayments,
	getPaymentById,
	updatePayment,
	deletePayment,
};
