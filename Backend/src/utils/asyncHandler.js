/* src/utils/asyncHandler.js */

/** Wrap an async Express handler and forward rejected promises to error middleware. */

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const getProducts = asyncHandler(async (_req, res) => {
  const products = await productService.getProducts();

  return successResponse(
    res,
    products,
    "Products retrieved successfully"
  );
});
