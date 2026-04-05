function decimalToPaise(value) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  const normalized = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new TypeError("Amount must be a valid rupee value with up to 2 decimals.");
  }

  const [rupees, decimals = ""] = normalized.split(".");
  return Number(rupees) * 100 + Number((decimals + "00").slice(0, 2));
}

function paiseToDisplay(paise) {
  return `₹${(paise / 100).toFixed(2)}`;
}

module.exports = {
  decimalToPaise,
  paiseToDisplay
};
