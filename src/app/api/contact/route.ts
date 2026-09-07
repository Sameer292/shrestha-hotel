import { NextResponse } from "next/server";
import { forwardInquiry, inquirySchema } from "@/lib/wordpress/client";

export async function POST(req: Request) {
	const body = await req.json().catch(() => null);
	const parsed = inquirySchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
	const ok = await forwardInquiry({
		kind: "contact",
		...parsed.data,
		company: (body as Record<string, unknown> | null)?.company ?? "",
	});
	return ok
		? NextResponse.json({ ok: true })
		: NextResponse.json({ ok: false }, { status: 502 });
}
