import { NextResponse } from "next/server";
import { getRooms } from "@/lib/wordpress/queries";

// Slim JSON endpoint so client components (booking form) stay CMS-driven.
export const revalidate = 10;

export async function GET() {
	const rooms = await getRooms();
	return NextResponse.json(rooms.map((r) => ({ slug: r.slug, name: r.name })));
}
