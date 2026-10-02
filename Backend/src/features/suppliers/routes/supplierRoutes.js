/* ****************************************************** */
/* File: #src/features/suppliers/routes/supplierRoutes.js */ 
/* ****************************************************** */

import express from "express";
import { authenticate } from "../../auth/middleware/authenticate.js";

import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

const router = express.Router();

router.use(authenticate);

// Collection routes
router
  .route("/")
  .get(getSuppliers)
  .post(createSupplier);

// Resource routes
router
  .route("/:id")
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

export default router;
