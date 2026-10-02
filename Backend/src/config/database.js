/* File: #src/config/database.js
 * Initialize Prisma, expose database connection helpers, and disconnect cleanly.
 * Set DATABASE_URL to the PostgreSQL connection string used by Prisma.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function connectDatabase() {
	await prisma.$connect();
	console.info('Connected to PostgreSQL.');
}

async function disconnectDatabase() {
	await prisma.$disconnect();
}

let shuttingDown = false;

async function handleShutdown(signal) {
	if (shuttingDown) return;
	shuttingDown = true;

	try {
		await disconnectDatabase();
		console.info(`Disconnected from PostgreSQL (${signal}).`);
	} catch (error) {
		console.error('Failed to disconnect from PostgreSQL:', error);
		process.exitCode = 1;
	}
}

process.once('SIGINT', () => void handleShutdown('SIGINT'));
process.once('SIGTERM', () => void handleShutdown('SIGTERM'));

module.exports = { prisma, connectDatabase, disconnectDatabase };




