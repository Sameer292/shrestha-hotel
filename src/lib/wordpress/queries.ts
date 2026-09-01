import { wpFetch } from "./client";
import {
	mockExperiences,
	mockFaqs,
	mockGallery,
	mockHome,
	mockRooms,
	mockSettings,
	mockTestimonials,
} from "./mock";
import type {
	Experience,
	FAQ,
	GalleryItem,
	HomeContent,
	HotelSettings,
	Room,
	Testimonial,
} from "./types";

// Each getter tries WP then falls back to mock in dev (never silently in prod — logs)
const isProd = process.env.NODE_ENV === "production";

async function withFallback<T>(
	wpData: T | null,
	mock: T,
	label: string,
): Promise<T> {
	if (wpData !== null && wpData !== undefined) {
		// also treat empty arrays as "no content yet" → use mock but without spamming
		if (Array.isArray(wpData) && wpData.length === 0) {
			if (!isProd) return mock;
			return mock;
		}
		return wpData;
	}
	if (!isProd) {
		// client.ts already warns once per GraphQL error, keep this quiet
		return mock;
	}
	console.warn(`[wordpress] ${label} — WP unavailable, serving fallback`);
	return mock;
}

// WPGraphQL shape helpers — map WP-native fields to our app types
type WPRoomNode = {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	featuredImage?: { node?: { sourceUrl: string; altText: string } } | null;
};
type WPExpNode = {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
};
type WPTermNode = { title: string; content: string; excerpt: string };

const CURATED_FALLBACKS = {
	room: [
		"https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&h=800&q=80",
		"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&h=800&q=80",
		"https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&h=800&q=80",
		"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=800&q=80",
	],
	experience:
		"https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&h=600&q=80",
	gallery:
		"https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&h=800&q=80",
};

function mapRoom(n: WPRoomNode, idx = 0): Room {
	return {
		slug: n.slug,
		name: n.title,
		excerpt: n.excerpt?.replace(/<[^>]*>/g, "").trim() || n.title,
		description: n.content?.replace(/<[^>]*>/g, "").trim() || n.excerpt || "",
		featuredImage: n.featuredImage?.node
			? {
					url: n.featuredImage.node.sourceUrl,
					alt: n.featuredImage.node.altText || n.title,
				}
			: {
					url: CURATED_FALLBACKS.room[idx % CURATED_FALLBACKS.room.length],
					alt: n.title,
				},
		gallery: [],
		capacity: 2,
		adults: 2,
		children: 0,
		bedType: "—",
		roomSize: "—",
		view: "—",
		amenities: [],
		featured: true,
		displayOrder: idx,
	};
}

function mapExperience(n: WPExpNode): Experience {
	return {
		slug: n.slug,
		name: n.title,
		excerpt: n.excerpt?.replace(/<[^>]*>/g, "").trim() || n.title,
		description: n.content?.replace(/<[^>]*>/g, "").trim() || "",
		featuredImage: {
			url: CURATED_FALLBACKS.experience,
			alt: n.title,
		},
		gallery: [],
		featured: true,
	};
}

// Minimal safe queries — only request fields that always exist on WPGraphQL
export async function getHotelSettings(): Promise<HotelSettings> {
	// hotelSettings is a dummy null field (mu-plugin) → always fallback to mock until ACF options exposed
	const data = await wpFetch<{ hotelSettings: HotelSettings | null }>(
		`query { hotelSettings { hotelName } }`,
	);
	return withFallback(
		data?.hotelSettings ?? null,
		mockSettings,
		"getHotelSettings",
	);
}

export async function getHomeContent(): Promise<HomeContent> {
	const data = await wpFetch<{ homeContent: HomeContent | null }>(
		`query { homeContent { hero } }`,
	);
	return withFallback(data?.homeContent ?? null, mockHome, "getHomeContent");
}

export async function getRooms(): Promise<Room[]> {
	const data = await wpFetch<{ rooms: { nodes: WPRoomNode[] } }>(
		`query { rooms { nodes { slug title excerpt content featuredImage { node { sourceUrl altText } } } } }`,
	);
	// data === null → WP unreachable → fallback to mock (dev only)
	if (!data) return withFallback(null, mockRooms, "getRooms");
	// WP reachable but empty → respect WordPress (no hardcoded rooms)
	if (!data.rooms?.nodes || data.rooms.nodes.length === 0) return [];
	return data.rooms.nodes.map((n, i) => mapRoom(n, i));
}

export async function getFeaturedRooms(): Promise<Room[]> {
	const rooms = await getRooms();
	return rooms.filter((r) => r.featured).slice(0, 4);
}
export async function getRoomBySlug(slug: string): Promise<Room | null> {
	const rooms = await getRooms();
	return rooms.find((r) => r.slug === slug) ?? null;
}

export async function getExperiences(): Promise<Experience[]> {
	const data = await wpFetch<{ experiences: { nodes: WPExpNode[] } }>(
		`query { experiences { nodes { slug title excerpt content } } }`,
	);
	if (!data) return withFallback(null, mockExperiences, "getExperiences");
	if (!data.experiences?.nodes || data.experiences.nodes.length === 0)
		return [];
	return data.experiences.nodes.map(mapExperience);
}
export async function getExperienceBySlug(
	slug: string,
): Promise<Experience | null> {
	const ex = await getExperiences();
	return ex.find((e) => e.slug === slug) ?? null;
}
export async function getTestimonials(): Promise<Testimonial[]> {
	const data = await wpFetch<{ testimonials: { nodes: WPTermNode[] } }>(
		`query { testimonials { nodes { title content excerpt } } }`,
	);
	if (!data) return withFallback(null, mockTestimonials, "getTestimonials");
	if (!data.testimonials?.nodes || data.testimonials.nodes.length === 0)
		return [];
	return data.testimonials.nodes.map((n) => ({
		guestName: n.title,
		guestLocation: "",
		quote: n.content?.replace(/<[^>]*>/g, "").trim() || n.excerpt || "",
		featured: true,
	}));
}
export async function getGallery(): Promise<GalleryItem[]> {
	const data = await wpFetch<{
		galleryItems: {
			nodes: (WPTermNode & {
				featuredImage?: { node?: { sourceUrl: string; altText: string } };
			})[];
		};
	}>(
		`query { galleryItems { nodes { title featuredImage { node { sourceUrl altText } } } } }`,
	);
	if (!data) return withFallback(null, mockGallery, "getGallery");
	if (!data.galleryItems?.nodes || data.galleryItems.nodes.length === 0)
		return [];
	return data.galleryItems.nodes.map((n, i) => ({
		image: n.featuredImage?.node
			? {
					url: n.featuredImage.node.sourceUrl,
					alt: n.featuredImage.node.altText || n.title,
				}
			: { url: CURATED_FALLBACKS.gallery, alt: n.title },
		category: "Hotel",
		displayOrder: i,
	}));
}
export async function getFaqs(): Promise<FAQ[]> {
	const data = await wpFetch<{ faqs: { nodes: WPTermNode[] } }>(
		`query { faqs { nodes { title content } } }`,
	);
	if (!data) return withFallback(null, mockFaqs, "getFaqs");
	if (!data.faqs?.nodes || data.faqs.nodes.length === 0) return [];
	return data.faqs.nodes.map((n, i) => ({
		question: n.title,
		answer: n.content?.replace(/<[^>]*>/g, "").trim() || "",
		category: "General",
		displayOrder: i,
	}));
}
