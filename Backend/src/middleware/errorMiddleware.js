/* ***************************************** */
/* File: src/middlewares/error.middleware.js */ 
/* ***************************************** */

export const errorHandler = (err, _req, res, _next) => {
    console.error(" Error: ", err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Inventory Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : underfined 
    });
};

