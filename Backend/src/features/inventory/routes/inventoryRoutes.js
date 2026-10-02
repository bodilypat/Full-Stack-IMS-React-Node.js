/* ******************************************************* */
/* File: #src/features/inventory/routes/inventoryRoutes.js */
/* ******************************************************* */

import express from "express";
import { authenticate } from "../../auth/middleware/authenticate.js";

import {
  getInventory,
  getInventoryItem,
  stockIn,
  stockOut,
  adjustStock,
  transferStock,
  getTransactions,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Protect every inventory endpoint.
router.use(authenticate);

// Keep static routes before the dynamic item route.
router.get("/", getInventory);
router.get("/transactions", getTransactions);
router.get("/:id", getInventoryItem);

// Stock movement operations.
router.post("/stock-in", stockIn);
router.post("/stock-out", stockOut);
router.post("/adjustment", adjustStock);
router.post("/transfer", transferStock);

export default router;
