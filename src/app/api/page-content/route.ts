import { NextResponse } from "next/server";
import { getGalleryPage } from "@/lib/wordpress/queries";

// ?page=gallery — page copy for client components (booking has no CPT;
// its hero stays hardcoded, rooms come from /api/rooms).
export const revalidate = 10;

const LOADERS: Record<string, () => Promise<unknown>> = {
	gallery: getGalleryPage,
};

export async function GET(req: Request) {
	const key = new URL(req.url).searchParams.get("page") ?? "";
	const load = LOADERS[key];
	if (!load) return NextResponse.json(null);
	return NextResponse.json(await load());
}
