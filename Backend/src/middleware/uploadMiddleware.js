/* ********************************************* */
/* File: #src/middleware/uploadMiddleware.js */
/* ********************************************* */

/* Handle secure multipart/form-data uploads. */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '../../uploads');
const allowedTypes = new Map([
	['image/jpeg', '.jpg'],
	['image/png', '.png'],
	['image/webp', '.webp'],
	['application/pdf', '.pdf'],
]);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, callback) => callback(null, uploadDirectory),
	filename: (_req, file, callback) => {
		callback(null, `${crypto.randomBytes(16).toString('hex')}${allowedTypes.get(file.mimetype)}`);
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 10,
		fields: 30,
		parts: 40,
	},
	fileFilter: (_req, file, callback) => {
		const extension = allowedTypes.get(file.mimetype);
		if (!extension || path.extname(file.originalname).toLowerCase() !== extension) {
			const error = new Error('Only JPEG, PNG, WebP, and PDF files are allowed.');
			error.status = 415;
			return callback(error);
		}
		callback(null, true);
	},
});

module.exports = upload;

