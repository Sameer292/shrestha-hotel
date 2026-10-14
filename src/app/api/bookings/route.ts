import { NextResponse } from "next/server";
import { wpBooking } from "@/lib/wordpress/client";

export const dynamic = "force-dynamic";

// POST: create { room_id, checkin, checkout, name, email, ... }.
// GET ?ref=&email= : lookup.
export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const r = await wpBooking("bookings", body as Record<string, unknown>);
	return NextResponse.json(r.data, { status: r.status });
}

export async function GET(req: Request) {
	const u = new URL(req.url);
	const r = await wpBooking("bookings/lookup", {
		ref: u.searchParams.get("ref") ?? "",
		email: u.searchParams.get("email") ?? "",
	});
	return NextResponse.json(r.data, { status: r.status });
}
