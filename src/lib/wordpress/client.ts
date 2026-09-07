import { z } from "zod";

const WP_URL =
	process.env.WORDPRESS_API_URL || process.env.WORDPRESS_GRAPHQL_URL || "";
export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || "https://www.shresthahotel.com";

// deduplicate repeated GraphQL errors in dev so terminal isn't spammed
const seenErrors = new Set<string>();

export async function wpFetch<T>(
	query: string,
	variables: Record<string, unknown> = {},
): Promise<T | null> {
	if (!WP_URL) return null;
	try {
		const res = await fetch(WP_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query, variables }),
			next: { revalidate: 10 },
		});
		if (!res.ok) return null;
		const json = await res.json();
		if (json.errors) {
			const key = JSON.stringify(json.errors.slice(0, 2));
			if (!seenErrors.has(key)) {
				seenErrors.add(key);
				console.warn(
					"[wpFetch] GraphQL errors (showing once per unique error, fallback to mock):",
					json.errors.slice(0, 2),
				);
			}
			return null;
		}
		return json.data as T;
	} catch (e) {
		const msg = String(e);
		if (!seenErrors.has(msg)) {
			seenErrors.add(msg);
			console.warn("[wpFetch] failed (fallback to mock):", msg.slice(0, 200));
		}
		return null;
	}
}

// Zod helpers for validation at trust boundaries
export const emailSchema = z.string().email();
export const inquirySchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().optional(),
	subject: z.string().min(2),
	message: z.string().min(10),
});
export const bookingSchema = z.object({
	checkin: z.string().min(4),
	checkout: z.string().min(4),
	adults: z.string().optional(),
	children: z.string().optional(),
	room: z.string().optional(),
	name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().optional(),
	requests: z.string().optional(),
	company: z.string().optional(),
});

// Server-side forward to the WP inbox (mu-plugins/shrestha-inquiry.php).
// Returns true when WP stored it. Never throws — callers map false to 502.
export async function forwardInquiry(
	body: Record<string, unknown>,
): Promise<boolean> {
	const api = process.env.WORDPRESS_API_URL || "";
	const base = api.replace(/\/graphql\/?$/, "");
	if (!base) return false;
	try {
		const res = await fetch(`${base}/wp-json/sh/v1/inquiry`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			cache: "no-store",
		});
		return res.ok;
	} catch {
		return false;
	}
}
