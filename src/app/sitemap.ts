import type { MetadataRoute } from "next";
import { getExperiences, getRooms } from "@/lib/wordpress/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const site =
		process.env.NEXT_PUBLIC_SITE_URL || "https://www.shresthahotel.com";
	const rooms = await getRooms().catch(() => []);
	const ex = await getExperiences().catch(() => []);
	const staticRoutes = [
		"",
		"/stay",
		"/hot-spring",
		"/experiences",
		"/dining",
		"/gallery",
		"/about",
		"/contact",
		"/booking",
	];
	return [
		...staticRoutes.map((r) => ({
			url: `${site}${r || "/"}`,
			lastModified: new Date(),
		})),
		...rooms.map((r) => ({
			url: `${site}/stay/${r.slug}`,
			lastModified: new Date(),
		})),
		...ex.map((e) => ({
			url: `${site}/experiences/${e.slug}`,
			lastModified: new Date(),
		})),
	];
}
