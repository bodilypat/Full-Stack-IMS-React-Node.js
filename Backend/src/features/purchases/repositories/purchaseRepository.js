/* **************************************************************** */
/* File: #src/features/purchases/repositories/purchaseRepository.js */
/* **************************************************************** */

const prisma = require('../../../config/prisma');

const purchaseRepository = {
	create(data) {
		return prisma.purchase.create({
			data,
			include: { items: true },
		});
	},

	findAll(options = {}) {
		const { where, orderBy = { createdAt: 'desc' }, skip, take } = options;
		return prisma.purchase.findMany({
			where,
			orderBy,
			skip,
			take,
			include: { items: true },
		});
	},

	findById(id) {
		return prisma.purchase.findUnique({
			where: { id },
			include: { items: true },
		});
	},

	update(id, data) {
		return prisma.purchase.update({
			where: { id },
			data,
			include: { items: true },
		});
	},

	delete(id) {
		return prisma.purchase.delete({ where: { id } });
	},

	updateStatus(id, status) {
		return prisma.purchase.update({
			where: { id },
			data: { status },
			include: { items: true },
		});
	},

	receivePurchase(id, data = {}) {
		return prisma.purchase.update({
			where: { id },
			data: {
				...data,
				status: 'RECEIVED',
				receivedAt: data.receivedAt || new Date(),
			},
			include: { items: true },
		});
	},
};

module.exports = purchaseRepository;

