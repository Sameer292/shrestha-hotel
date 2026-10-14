import { NextResponse } from "next/server";
import { wpBooking } from "@/lib/wordpress/client";

export const dynamic = "force-dynamic";

// Body: { room_id, checkin, checkout, adults?, children?, infants?,
// extra_beds?, meal_plan?, pickup? }.
export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const r = await wpBooking("quote", body as Record<string, unknown>);
	return NextResponse.json(r.data, { status: r.status });
}
