/* ************************************************** 
** File:  #src/features/purchases/purchaseService.js 
** Create purchase
** Calculate subtotal/tax/discount/total
** Validate supplier
** Validate products
** Create purchase items
** Update purchase status
** Receive purchase
** Update inventory after receiving
** Create stock movements
** Handle purchase cancellation
*****************************************************/ 

export const createPurchase = async ({
  supplierId,
  items,
  discount = 0,
  tax = 0,
  notes,
  userId,
}) => {
  if (!supplierId) {
    throw new Error("Supplier is required");
  }

  if (!userId) {
    throw new Error("User is required to create a purchase");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Purchase must contain at least one item");
  }

  for (const [index, item] of items.entries()) {
    if (!item || !item.productId) {
      throw new Error(`Purchase item ${index + 1} must specify a product`);
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error(`Purchase item ${index + 1} must have a positive quantity`);
    }

    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      throw new Error(`Purchase item ${index + 1} must have a valid unit price`);
    }
  }

  if (!Number.isFinite(discount) || discount < 0) {
    throw new Error("Discount must be a non-negative number");
  }

  if (!Number.isFinite(tax) || tax < 0) {
    throw new Error("Tax must be a non-negative number");
  }

  const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;
  const subtotal = roundMoney(
    items.reduce((sum, item, index) => {
      const lineTotal = item.quantity * item.unitPrice;
      if (!Number.isFinite(lineTotal)) {
        throw new Error(`Purchase item ${index + 1} total is invalid`);
      }
      return sum + lineTotal;
    }, 0),
  );
  const roundedDiscount = roundMoney(discount);
  const roundedTax = roundMoney(tax);

  if (roundedDiscount > subtotal) {
    throw new Error("Discount cannot exceed the purchase subtotal");
  }

  const total = roundMoney(subtotal + roundedTax - roundedDiscount);

  return purchaseRepository.createPurchase({
    supplierId,
    items,
    subtotal,
    discount: roundedDiscount,
    tax: roundedTax,
    total,
    notes,
    userId,
  });
};

