import { NextResponse } from "next/server";
import { bookingSchema, forwardInquiry } from "@/lib/wordpress/client";

export async function POST(req: Request) {
	const body = await req.json().catch(() => null);
	const parsed = bookingSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
	const d = parsed.data;
	const message =
		`Stay ${d.checkin} → ${d.checkout}. ${d.adults ?? "?"} adults, ${d.children ?? "?"} children. ` +
		`Room: ${d.room || "Any"}. Requests: ${d.requests?.trim() || "—"}`;
	const ok = await forwardInquiry({
		kind: "booking",
		name: d.name,
		email: d.email,
		phone: d.phone || "",
		subject: `Booking inquiry — ${d.checkin} → ${d.checkout}`,
		message,
		company: d.company ?? "",
	});
	return ok
		? NextResponse.json({ ok: true })
		: NextResponse.json({ ok: false }, { status: 502 });
}
