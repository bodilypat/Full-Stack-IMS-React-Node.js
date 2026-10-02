/* File: #src/features/sales/repositories/saleRepository.js
**  database operations for sales
**  - create()
**  - findAll()
**  - findById()
**  - update()
**  - delete()
**  - cancel()
**  - findByInvoiceId()
*/

const Sale = require("../models/saleModel");

const create = (saleData) => Sale.create(saleData);

const findAll = (filter = {}, options = {}) => {
	let query = Sale.find(filter);

	if (options.sort) query = query.sort(options.sort);
	if (options.skip !== undefined) query = query.skip(options.skip);
	if (options.limit !== undefined) query = query.limit(options.limit);
	if (options.populate) query = query.populate(options.populate);

	return query.exec();
};

const findById = (id) => Sale.findById(id).exec();

const update = (id, saleData) =>
	Sale.findByIdAndUpdate(id, saleData, {
		new: true,
		runValidators: true,
	}).exec();

const deleteSale = (id) => Sale.findByIdAndDelete(id).exec();

const cancel = (id) =>
	Sale.findByIdAndUpdate(
		id,
		{ status: "cancelled", cancelledAt: new Date() },
		{ new: true, runValidators: true }
	).exec();

const findByInvoiceId = (invoiceId) => Sale.findOne({ invoiceId }).exec();

module.exports = {
	create,
	findAll,
	findById,
	update,
	delete: deleteSale,
	cancel,
	findByInvoiceId,
};



