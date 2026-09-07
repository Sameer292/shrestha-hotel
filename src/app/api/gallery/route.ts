import { NextResponse } from "next/server";
import { getGallery } from "@/lib/wordpress/queries";

// ponytail: gallery page is a client component (filter state) — one slim
// JSON endpoint keeps every photo CMS-driven instead of mock imports.
export const revalidate = 10;

export async function GET() {
	const items = await getGallery();
	return NextResponse.json(items);
}
