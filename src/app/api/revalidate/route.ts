import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const secret =
		req.headers.get("x-revalidate-secret") ||
		req.nextUrl.searchParams.get("secret");
	if (
		!process.env.REVALIDATE_SECRET ||
		secret !== process.env.REVALIDATE_SECRET
	) {
		return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
	}
	const body = await req.json().catch(() => ({}));
	const path = body.path as string | undefined;
	if (path) revalidatePath(path);
	else {
		revalidatePath("/");
		revalidatePath("/stay");
		revalidatePath("/experiences");
	}
	return NextResponse.json({ revalidated: true, path: path ?? "/" });
}
