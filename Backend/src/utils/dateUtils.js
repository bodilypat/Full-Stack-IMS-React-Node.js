/* File:  #src/utils/dateUtils.js 
** formatDate()
** formatDateTime()
** startOfDay()
** endOfDay()
** startOfMonth()
** endOfMonth()
**isValidDate()
*/

const isValidDate = (value) =>
	value instanceof Date && !Number.isNaN(value.getTime());

const toDate = (value) => {
	const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
	return isValidDate(date) ? date : null;
};

const pad = (value) => String(value).padStart(2, '0');

const formatDate = (value) => {
	const date = toDate(value);
	if (!date) return '';

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatDateTime = (value) => {
	const date = toDate(value);
	if (!date) return '';

	return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const startOfDay = (value) => {
	const date = toDate(value);
	if (!date) return null;

	date.setHours(0, 0, 0, 0);
	return date;
};

const endOfDay = (value) => {
	const date = toDate(value);
	if (!date) return null;

	date.setHours(23, 59, 59, 999);
	return date;
};

const startOfMonth = (value) => {
	const date = toDate(value);
	if (!date) return null;

	date.setDate(1);
	date.setHours(0, 0, 0, 0);
	return date;
};

const endOfMonth = (value) => {
	const date = toDate(value);
	if (!date) return null;

	date.setMonth(date.getMonth() + 1, 0);
	date.setHours(23, 59, 59, 999);
	return date;
};

module.exports = {
	formatDate,
	formatDateTime,
	startOfDay,
	endOfDay,
	startOfMonth,
	endOfMonth,
	isValidDate,
};

