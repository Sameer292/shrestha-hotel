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

const isProd = process.env.NODE_ENV === "production";

// WP media URLs come back absolute (http://shrestha.localhost:8081/…),
// which other devices can't resolve. Strip to a relative path — both the
// dev proxy and prod nginx route /wp-content/* to WordPress, and
// next.config rewrites cover direct :3000 access.
export function wpMedia(url: string): string {
	const i = url.indexOf("/wp-content/uploads/");
	return i >= 0 ? url.slice(i) : url;
}

async function withFallback<T>(
	wpData: T | null,
	mock: T,
	label: string,
): Promise<T> {
	if (wpData !== null && wpData !== undefined) {
		if (Array.isArray(wpData) && wpData.length === 0) {
			return mock;
		}
		return wpData;
	}
	if (!isProd) return mock;
	console.warn(`[wordpress] ${label} — WP unavailable, serving fallback`);
	return mock;
}

// WPGraphQL shape with ACF fields (lowercase via WPGraphQL for ACF)
type WPRoomNode = {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	featuredImage?: { node?: { sourceUrl: string; altText: string } } | null;
	roomFields?: {
		startingprice?: number | null;
		currency?: string | null;
		capacity?: number | null;
		adults?: number | null;
		children?: number | null;
		bedtype?: string | null;
		roomsize?: string | null;
		view?: string | null;
		amenities?: string | null;
		checkin?: string | null;
		checkout?: string | null;
		featured?: boolean | null;
		displayorder?: number | null;
		gallery?: { sourceUrl: string; altText: string }[] | null;
	} | null;
};
type WPExpNode = {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	featuredImage?: { node?: { sourceUrl: string; altText: string } } | null;
	experienceFields?: {
		duration?: string | null;
		difficulty?: string | null;
		season?: string | null;
		featured?: boolean | null;
	} | null;
};
type WPTermNode = {
	title: string;
	content: string;
	excerpt: string;
	testimonialFields?: {
		guestname?: string | null;
		guestlocation?: string | null;
		quote?: string | null;
		rating?: number | null;
		featured?: boolean | null;
	} | null;
	faqFields?: {
		question?: string | null;
		answer?: string | null;
		category?: string | null;
		displayorder?: number | null;
	} | null;
	galleryItemFields?: {
		category?: string | null;
		caption?: string | null;
		displayorder?: number | null;
	} | null;
	featuredImage?: { node?: { sourceUrl: string; altText: string } } | null;
};

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
	const f = n.roomFields;
	return {
		slug: n.slug,
		name: n.title,
		excerpt: n.excerpt?.replace(/<[^>]*>/g, "").trim() || n.title,
		description: n.content?.replace(/<[^>]*>/g, "").trim() || n.excerpt || "",
		featuredImage: n.featuredImage?.node
			? {
					url: wpMedia(n.featuredImage.node.sourceUrl),
					alt: n.featuredImage.node.altText || n.title,
				}
			: {
					url: CURATED_FALLBACKS.room[idx % CURATED_FALLBACKS.room.length],
					alt: n.title,
				},
		gallery: (f?.gallery ?? [])
			.filter((g) => g?.sourceUrl)
			.map((g) => ({ url: wpMedia(g.sourceUrl), alt: g.altText || n.title })),
		startingPrice: f?.startingprice ?? undefined,
		currency: f?.currency ?? "NPR",
		capacity: f?.capacity ?? 2,
		adults: f?.adults ?? 2,
		children: f?.children ?? 0,
		bedType: f?.bedtype ?? "—",
		roomSize: f?.roomsize ?? "—",
		view: f?.view ?? "—",
		amenities: f?.amenities
			? f.amenities.split(",").map((a) => a.trim())
			: [],
		checkIn: f?.checkin ?? "2:00 PM",
		checkOut: f?.checkout ?? "11:00 AM",
		featured: f?.featured ?? false,
		displayOrder: f?.displayorder ?? idx,
	};
}

function mapExperience(n: WPExpNode): Experience {
	const f = n.experienceFields;
	return {
		slug: n.slug,
		name: n.title,
		excerpt: n.excerpt?.replace(/<[^>]*>/g, "").trim() || n.title,
		description: n.content?.replace(/<[^>]*>/g, "").trim() || "",
		featuredImage: n.featuredImage?.node
			? {
					url: wpMedia(n.featuredImage.node.sourceUrl),
					alt: n.featuredImage.node.altText || n.title,
				}
			: {
					url: CURATED_FALLBACKS.experience,
					alt: n.title,
				},
		gallery: [],
		duration: f?.duration ?? undefined,
		difficulty: f?.difficulty ?? undefined,
		season: f?.season ?? undefined,
		featured: f?.featured ?? false,
	};
}

// ============================================
// QUERIES
// ============================================

const SETTINGS_FIELDS = `
	hotelName tagline phone secondaryPhone email whatsapp address
	googleMapsUrl googleMapsEmbed latitude longitude
	instagram facebook tripadvisor bookingUrl
	checkIn checkOut currency footerDescription
`;
const MEDIA_FIELDS = `image { url alt }`;
const MEDIA_LIST = `images { url alt }`;

export async function getHotelSettings(): Promise<HotelSettings> {
	const data = await wpFetch<{ hotelSettings: HotelSettings | null }>(
		`query { hotelSettings { ${SETTINGS_FIELDS} } }`,
	);
	return withFallback(
		data?.hotelSettings ?? null,
		mockSettings,
		"getHotelSettings",
	);
}

export async function getHomeContent(): Promise<HomeContent> {
	const data = await wpFetch<{ homeContent: HomeContent | null }>(
		`query { homeContent {
			hero { eyebrow heading subheading ${MEDIA_FIELDS} primaryCta secondaryCta }
			intro { heading body ${MEDIA_LIST} }
			hotSpring { heading text ${MEDIA_FIELDS} temperature hours cta }
			dining { heading text ${MEDIA_LIST} cta }
			finalCta { heading description ${MEDIA_FIELDS} }
			about { heading body ${MEDIA_FIELDS} }
		} }`,
	);
	const home = data?.homeContent ?? null;
	if (home) {
		const fix = (m: { url: string; alt: string }) => ({
			...m,
			url: wpMedia(m.url),
		});
		home.hero.image = fix(home.hero.image);
		home.intro.images = home.intro.images.map(fix);
		home.hotSpring.image = fix(home.hotSpring.image);
		home.dining.images = home.dining.images.map(fix);
		home.finalCta.image = fix(home.finalCta.image);
		home.about.image = fix(home.about.image);
	}
	return withFallback(home, mockHome, "getHomeContent");
}

export async function getRooms(): Promise<Room[]> {
	const data = await wpFetch<{ rooms: { nodes: WPRoomNode[] } }>(
		`query {
			rooms {
				nodes {
					slug title excerpt content
					featuredImage { node { sourceUrl altText } }
					roomFields {
						startingprice currency capacity adults children
						bedtype roomsize view amenities
						checkin checkout featured displayorder
						gallery { sourceUrl altText }
					}
				}
			}
		}`,
	);
	if (!data) return withFallback(null, mockRooms, "getRooms");
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
		`query {
			experiences {
				nodes {
					slug title excerpt content
					featuredImage { node { sourceUrl altText } }
					experienceFields {
						duration difficulty season featured
					}
				}
			}
		}`,
	);
	if (!data) return withFallback(null, mockExperiences, "getExperiences");
	if (!data.experiences?.nodes || data.experiences.nodes.length === 0)
		return [];
	return data.experiences.nodes.map((n) => mapExperience(n));
}

export async function getExperienceBySlug(
	slug: string,
): Promise<Experience | null> {
	const ex = await getExperiences();
	return ex.find((e) => e.slug === slug) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
	const data = await wpFetch<{ testimonials: { nodes: WPTermNode[] } }>(
		`query {
			testimonials {
				nodes {
					title content
					testimonialFields {
						guestname guestlocation quote rating featured
					}
				}
			}
		}`,
	);
	if (!data) return withFallback(null, mockTestimonials, "getTestimonials");
	if (!data.testimonials?.nodes || data.testimonials.nodes.length === 0)
		return [];
	return data.testimonials.nodes.map((n) => {
		const f = n.testimonialFields;
		const contentText =
			n.content?.replace(/<[^>]*>/g, "").trim() || n.excerpt || "";
		return {
			guestName: n.title || f?.guestname || "",
			guestLocation: f?.guestlocation ?? "",
			quote: contentText || f?.quote || "",
			rating: f?.rating ?? undefined,
			featured: f?.featured ?? false,
		};
	});
}

export async function getGallery(): Promise<GalleryItem[]> {
	const data = await wpFetch<{
		galleryItems: { nodes: WPTermNode[] };
	}>(
		`query {
			galleryItems {
				nodes {
					title
					featuredImage { node { sourceUrl altText } }
					galleryItemFields {
						category caption displayorder
					}
				}
			}
		}`,
	);
	if (!data) return withFallback(null, mockGallery, "getGallery");
	if (!data.galleryItems?.nodes || data.galleryItems.nodes.length === 0)
		return [];
	return data.galleryItems.nodes.map((n, i) => {
		const f = n.galleryItemFields;
		return {
			image: n.featuredImage?.node
				? {
						url: wpMedia(n.featuredImage.node.sourceUrl),
						alt: n.featuredImage.node.altText || n.title,
					}
				: { url: CURATED_FALLBACKS.gallery, alt: n.title },
			category: f?.category ?? "Hotel",
			caption: f?.caption ?? n.title,
			displayOrder: f?.displayorder ?? i,
		};
	});
}

export async function getFaqs(): Promise<FAQ[]> {
	const data = await wpFetch<{ faqs: { nodes: WPTermNode[] } }>(
		`query {
			faqs {
				nodes {
					title content
					faqFields {
						question answer category displayorder
					}
				}
			}
		}`,
	);
	if (!data) return withFallback(null, mockFaqs, "getFaqs");
	if (!data.faqs?.nodes || data.faqs.nodes.length === 0) return [];
	return data.faqs.nodes.map((n, i) => {
		const f = n.faqFields;
		const contentText =
			n.content?.replace(/<[^>]*>/g, "").trim() || "";
		return {
			question: n.title || f?.question || "",
			answer: contentText || f?.answer || "",
			category: f?.category ?? "General",
			displayOrder: f?.displayorder ?? i,
		};
	});
}
