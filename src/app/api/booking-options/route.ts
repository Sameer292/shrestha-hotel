import { NextResponse } from "next/server";
import { getHotelSettings } from "@/lib/wordpress/queries";

export const dynamic = "force-dynamic";

// Booking form options: meal plans + extra prices + tax, all CMS-driven.
export async function GET() {
	const s = await getHotelSettings();
	const plans = (s.mealPlans ?? "")
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean)
		.map((l) => {
			const [name, ...rest] = l.split("|");
			const price = parseFloat(rest.join("|").trim());
			return { name: name.trim(), price: Number.isFinite(price) ? price : 0 };
		})
		.filter((p) => p.name);
	return NextResponse.json({
		currency: s.currency || "NPR",
		mealPlans: plans,
		extraBedPrice: parseFloat(s.extraBedPrice ?? "") || 0,
		pickupPrice: parseFloat(s.pickupPrice ?? "") || 0,
		taxPercent: parseFloat(s.taxPercent ?? "") || 0,
		servicePercent: parseFloat(s.servicePercent ?? "") || 0,
		checkIn: s.checkIn || "",
		checkOut: s.checkOut || "",
		policies: [
			s.cancellationPolicy || "",
			s.paymentTerms || "",
			s.childPolicy || "",
			s.idRequirement || "",
		].filter(Boolean),
	});
}
