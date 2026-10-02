/* ********************************************************* */
/* File: #src/features/suppliers/services/supplierService.js */ 
/* ********************************************************* */

import * as supplierRepository from "../repositories/supplierRepository.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : email;

const validateSupplierData = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Supplier data is required");
  }

  if (data.email !== undefined && data.email !== null) {
    const email = normalizeEmail(data.email);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("A valid supplier email is required");
    }
  }
};

const ensureUniqueEmail = async (email, id) => {
  if (!email) return;

  const existing = await supplierRepository.findByEmail(email);
  if (existing && String(existing.id) !== String(id)) {
    throw new Error("Supplier email already exists");
  }
};

export const getSuppliers = async (query) => {
  return supplierRepository.findSuppliers(query);
};

export const getSupplier = async (id) => {
  const supplier =
    await supplierRepository.findSupplierById(id);

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
};

export const createSupplier = async (data) => {
  validateSupplierData(data);
  const supplierData = { ...data };
  supplierData.email = normalizeEmail(supplierData.email);
  await ensureUniqueEmail(supplierData.email);

  return supplierRepository.createSupplier(supplierData);
};

export const updateSupplier = async (id, data) => {
  await getSupplier(id);
  validateSupplierData(data);

  const supplierData = { ...data };
  if (supplierData.email !== undefined) {
    supplierData.email = normalizeEmail(supplierData.email);
    await ensureUniqueEmail(supplierData.email, id);
  }

  return supplierRepository.updateSupplier(id, supplierData);
};

export const deleteSupplier = async (id) => {
  await getSupplier(id);

  return supplierRepository.deleteSupplier(id);
};

export const getSupplierProducts = async (id) => {
  await getSupplier(id);

  return supplierRepository.findSupplierProducts(id);
};

export const getSupplierPurchaseHistory = async (
  id,
  query
) => {
  await getSupplier(id);

  return supplierRepository.findPurchaseHistory(id, query);
};
