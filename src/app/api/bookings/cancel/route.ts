import { NextResponse } from "next/server";
import { wpBooking } from "@/lib/wordpress/client";

export const dynamic = "force-dynamic";

// Body: { ref, email }.
export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const r = await wpBooking(
		"bookings/cancel",
		body as Record<string, unknown>,
	);
	return NextResponse.json(r.data, { status: r.status });
}
