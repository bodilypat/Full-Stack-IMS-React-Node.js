/* 
** File: #src/features/sales/routes/paymentRoutes.js
** Payment routes. Mount under /sales to expose /:id/payments.  
*/

const express = require("express");
const { addPayment, getPayments } = require("../controllers/paymentController");

const router = express.Router();

// The route parameter is the sale ID.
router.route("/:id/payments").get(getPayments).post(addPayment);

module.exports = router;


