/* File: #src/features/sales/utils/saleUtils.js
** sale utils
** - calculateTotal
** - formatSaleData
*/

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calculateTotal = (items = []) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((total, item) => {
    const quantity = normalizeNumber(item?.quantity, 1);
    const unitPrice = normalizeNumber(item?.unitPrice ?? item?.price, 0);
    const itemTotal = normalizeNumber(item?.total, unitPrice * quantity);

    return total + itemTotal;
  }, 0);
};

const formatSaleData = (sale = {}) => {
  const items = Array.isArray(sale.items) ? sale.items : [];
  const subtotal = calculateTotal(items);
  const tax = normalizeNumber(sale.tax, 0);
  const discount = normalizeNumber(sale.discount, 0);
  const total = normalizeNumber(sale.total, subtotal + tax - discount);

  return {
    id: sale._id ?? sale.id ?? null,
    customerId: sale.customerId ?? sale.customer ?? null,
    customerName: sale.customerName ?? sale.customer ?? null,
    invoiceNumber: sale.invoiceNumber ?? sale.invoice ?? null,
    status: sale.status ?? 'completed',
    items: items.map((item, index) => {
      const quantity = normalizeNumber(item?.quantity, 1);
      const unitPrice = normalizeNumber(item?.unitPrice ?? item?.price, 0);
      const itemTotal = normalizeNumber(item?.total, unitPrice * quantity);

      return {
        id: item?._id ?? item?.id ?? `${sale.id ?? 'sale'}-${index}`,
        productId: item?.productId ?? item?.product ?? null,
        productName: item?.productName ?? item?.name ?? 'Unknown Product',
        quantity,
        unitPrice,
        total: itemTotal,
      };
    }),
    subtotal,
    tax,
    discount,
    total,
    paymentMethod: sale.paymentMethod ?? 'cash',
    createdAt: sale.createdAt ?? new Date().toISOString(),
    updatedAt: sale.updatedAt ?? sale.createdAt ?? new Date().toISOString(),
  };
};

module.exports = {
  calculateTotal,
  formatSaleData,
};






