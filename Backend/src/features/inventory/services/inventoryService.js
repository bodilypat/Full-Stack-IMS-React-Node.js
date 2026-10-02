/* File: #src/features/inventory/services/inventoryService.js */ 
import * as inventoryRepository
  from "../repositories/inventoryRepository.js";

const validateStockMovement = ({
  productId,
  locationId,
  quantity,
  referenceType,
  referenceId,
  userId,
}) => {
  if (!productId || !locationId || !userId) {
    throw new Error("Product, location, and user are required");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  if (Boolean(referenceType) !== Boolean(referenceId)) {
    throw new Error(
      "Reference type and reference ID must be provided together",
    );
  }
};

export const stockIn = async ({
  productId,
  locationId,
  quantity,
  referenceType,
  referenceId,
  userId,
}) => {
  validateStockMovement({
    productId,
    locationId,
    quantity,
    referenceType,
    referenceId,
    userId,
  });

  return inventoryRepository.executeStockIn({
    productId,
    locationId,
    quantity,
    referenceType,
    referenceId,
    userId,
  });
};

export const stockOut = async ({
  productId,
  locationId,
  quantity,
  referenceType,
  referenceId,
  userId,
}) => {
  validateStockMovement({
    productId,
    locationId,
    quantity,
    referenceType,
    referenceId,
    userId,
  });

  return inventoryRepository.executeStockOut({
    productId,
    locationId,
    quantity,
    referenceType,
    referenceId,
    userId,
  });
};
