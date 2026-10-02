/* File: #src/features/sales/controllers/paymentController.js
** - Handle payment-related operations for sales.
** -  POST /api/sales/:id/payments
** -  GET /api/sales/:id/payments
** -  PUT /api/sales/:id/payments
*/

const Sale = require('../models/saleModel');

const paymentFields = ['amount', 'method', 'date', 'reference', 'notes'];

function pickPaymentFields(source) {
	return paymentFields.reduce((payment, field) => {
		if (source[field] !== undefined) payment[field] = source[field];
		return payment;
	}, {});
}

function isValidAmount(amount) {
	return Number.isFinite(Number(amount)) && Number(amount) > 0;
}

async function getSale(req, res) {
	const sale = await Sale.findById(req.params.id);
	if (!sale) {
		res.status(404).json({ message: 'Sale not found' });
		return null;
	}
	return sale;
}

exports.createPayment = async (req, res, next) => {
	try {
		const sale = await getSale(req, res);
		if (!sale) return;

		if (!isValidAmount(req.body.amount)) {
			return res.status(400).json({ message: 'A payment amount greater than zero is required' });
		}

		sale.payments = sale.payments || [];
		sale.payments.push({
			...pickPaymentFields(req.body),
			amount: Number(req.body.amount),
			date: req.body.date ? new Date(req.body.date) : new Date(),
		});
		await sale.save();

		return res.status(201).json({
			message: 'Payment recorded successfully',
			payment: sale.payments[sale.payments.length - 1],
			payments: sale.payments,
		});
	} catch (error) {
		return next(error);
	}
};

exports.getPayments = async (req, res, next) => {
	try {
		const sale = await getSale(req, res);
		if (!sale) return;

		return res.status(200).json({ payments: sale.payments || [] });
	} catch (error) {
		return next(error);
	}
};

exports.updatePayments = async (req, res, next) => {
	try {
		const sale = await getSale(req, res);
		if (!sale) return;

		sale.payments = sale.payments || [];

		if (Array.isArray(req.body.payments)) {
			const invalidPayment = req.body.payments.some(
				(payment) => !payment || !isValidAmount(payment.amount),
			);
			if (invalidPayment) {
				return res.status(400).json({ message: 'Every payment must have an amount greater than zero' });
			}
			sale.payments = req.body.payments.map((payment) => ({
				...pickPaymentFields(payment),
				amount: Number(payment.amount),
				date: payment.date ? new Date(payment.date) : new Date(),
			}));
		} else {
			const paymentId = req.body.paymentId || req.body._id || req.body.id;
			const payment = paymentId && sale.payments.id
				? sale.payments.id(paymentId)
				: sale.payments.find((item) => String(item._id) === String(paymentId));

			if (!payment) {
				return res.status(400).json({ message: 'Provide a valid paymentId or a payments array' });
			}
			if (req.body.amount !== undefined && !isValidAmount(req.body.amount)) {
				return res.status(400).json({ message: 'A payment amount must be greater than zero' });
			}

			Object.assign(payment, pickPaymentFields(req.body));
			if (req.body.amount !== undefined) payment.amount = Number(req.body.amount);
		}

		await sale.save();
		return res.status(200).json({
			message: 'Payments updated successfully',
			payments: sale.payments,
		});
	} catch (error) {
		return next(error);
	}
};
