export function cn(...c: (string | false | null | undefined)[]) {
	return c.filter(Boolean).join(" ");
}
export function formatPrice(price?: number, currency = "NPR") {
	if (price == null) return null;
	return new Intl.NumberFormat("en-NP", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(price);
}
