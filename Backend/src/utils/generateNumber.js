/* File: #src/utils/generateNumber.js
** Products
** Purchases
** Sales
** Invoices
** Payments
** Stock movements
** Returns
*/

const sequenceStore = new Map();

function padNumber(value, length = 4) {
  return String(value).padStart(length, "0");
}

function formatDate(date = new Date(), format = "YYMMDD") {
  const year = date.getFullYear();
  const shortYear = String(year).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const replacements = {
    YYYY: year,
    YY: shortYear,
    MM: month,
    DD: day,
  };

  return format.replace(/YYYY|YY|MM|DD/g, (token) => replacements[token]);
}

function generateNumber(type = "GEN", options = {}) {
  const config = {
    prefix: type.toUpperCase(),
    separator: "-",
    dateFormat: "YYMMDD",
    padLength: 4,
    startAt: 1,
    resetDaily: true,
    ...options,
  };

  const date = config.date || new Date();
  const dateKey = formatDate(date, config.dateFormat);
  const sequenceKey = `${config.prefix}|${config.resetDaily ? dateKey : "global"}`;

  const currentValue = sequenceStore.get(sequenceKey) ?? config.startAt - 1;
  const nextValue = currentValue + 1;

  sequenceStore.set(sequenceKey, nextValue);

  return `${config.prefix}${config.separator}${dateKey}${config.separator}${padNumber(nextValue, config.padLength)}`;
}

function generateCustomNumber(prefix = "DOC", options = {}) {
  return generateNumber(prefix, options);
}

function resetSequence(type = null, date = new Date()) {
  if (!type) {
    sequenceStore.clear();
    return;
  }

  const prefix = type.toUpperCase();
  const dailyKey = `${prefix}|${formatDate(date, "YYMMDD")}`;
  const globalKey = `${prefix}|global`;

  sequenceStore.delete(dailyKey);
  sequenceStore.delete(globalKey);
}

module.exports = generateNumber;
module.exports.generateNumber = generateNumber;
module.exports.generateCustomNumber = generateCustomNumber;
module.exports.resetSequence = resetSequence;
module.exports.default = generateNumber;
 


