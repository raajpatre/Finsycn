export function formatPaise(paise) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format((paise || 0) / 100);
}

export function decimalStringToPaise(value) {
  const normalized = String(value || "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Enter a valid amount.");
  }

  const [rupees, decimals = ""] = normalized.split(".");
  return Number(rupees) * 100 + Number((decimals + "00").slice(0, 2));
}
