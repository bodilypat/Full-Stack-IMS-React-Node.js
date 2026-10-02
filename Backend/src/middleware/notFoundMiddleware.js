/* File: #src/middleware/notFoundMiddleware.js 
** handle requests for undefined routes
** GET /api/unknown
** No matching route found 
** notFoundMiddleware 
** 404 response 
*/

const notFoundMiddleware = (req, res) => {
	res.status(404).json({
		message: `Not found: ${req.originalUrl}`,
	});
};

module.exports = notFoundMiddleware;







