/* File: #src/features/sales/repositories/saleReturnRepository.js
**  database operations for sale returns
**  - create()
**  - findAll()
**  - findById()
**  - update()
**  - delete()
*/

const create = (saleReturnData) => SaleReturn.create(saleReturnData);

const findAll = (filter = {}, options = {}) => {
	let query = SaleReturn.find(filter);

	if (options.sort) query = query.sort(options.sort);
	if (options.skip !== undefined) query = query.skip(options.skip);
	if (options.limit !== undefined) query = query.limit(options.limit);
	if (options.populate) query = query.populate(options.populate);

	return query.exec();
};

const findById = (id) => SaleReturn.findById(id).exec();

const update = (id, saleReturnData) =>
	SaleReturn.findByIdAndUpdate(id, saleReturnData, {
		new: true,
		runValidators: true,
	}).exec();

const deleteSaleReturn = (id) => SaleReturn.findByIdAndDelete(id).exec();

module.exports = {
	create,
	findAll,
	findById,
	update,
	delete: deleteSaleReturn,
};
