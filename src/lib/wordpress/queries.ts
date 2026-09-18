import { wpFetch } from "./client";
import {
	mockExperiences,
	mockFaqs,
	mockGallery,
	mockRooms,
	mockSettings,
	mockTestimonials,
} from "./mock";
import type {
	AboutPage,
	ContactPage,
	DiningPage,
	EventsPage,
	Experience,
	ExperiencesPage,
	FAQ,
	GalleryItem,
	GalleryPage,
	HomeEntry,
	HotSpringPage,
	HotelSettings,
	Room,
	StayPage,
	Testimonial,
	WellnessPage,
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

// Item CPTs (room, experience, testimonial, gallery_item, faq) are native
// WPGraphQL nodes — one post per item, ACF fields via WPGraphQL for ACF
// (field names arrive lowercase), featured image = card/hero photo.
type WPImage = { sourceUrl: string; altText: string };

type WPItemNode = {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	featuredImage?: { node?: WPImage } | null;
};

type WPRoomFields = {
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
	galleryimage1?: WPImage | null;
	galleryimage2?: WPImage | null;
	galleryimage3?: WPImage | null;
	featured?: boolean | null;
	displayorder?: number | null;
};

type WPExperienceFields = {
	paragraph2?: string | null;
	paragraph3?: string | null;
	activities?: string | null;
	location?: string | null;
	photo2?: WPImage | null;
	photo3?: WPImage | null;
	mapimage?: WPImage | null;
	mapurl?: string | null;
	featured?: boolean | null;
};

type WPTestimonialFields = {
	guestname?: string | null;
	guestlocation?: string | null;
	quote?: string | null;
	rating?: number | null;
	featured?: boolean | null;
};

type WPGalleryItemFields = {
	category?: string | null;
	caption?: string | null;
	displayorder?: number | null;
};

type WPFAQFields = {
	question?: string | null;
	answer?: string | null;
	category?: string | null;
	displayorder?: number | null;
};

// Local placeholder used whenever WordPress has no image for an entry.
// Upload real photos as Featured image / gallery in WP Admin to replace it.
export const PLACEHOLDER_IMAGE = "/placeholder.svg";

function placeholder(title: string) {
	return { url: PLACEHOLDER_IMAGE, alt: title };
}

function nodeImage(
	n: WPItemNode,
): { url: string; alt: string } {
	const img = n.featuredImage?.node;
	const title = clean(n.title);
	return img?.sourceUrl
		? { url: wpMedia(img.sourceUrl), alt: img.altText || title }
		: placeholder(title);
}

function mapRoom(n: WPItemNode & { roomFields?: WPRoomFields | null }): Room {
	const f = n.roomFields;
	const name = clean(n.title);
	return {
		slug: n.slug,
		name,
		excerpt: clean(n.excerpt) || name,
		description: clean(n.content),
		featuredImage: nodeImage(n),
		gallery: wpImages(
			[f?.galleryimage1, f?.galleryimage2, f?.galleryimage3],
			name,
		),
		startingPrice: f?.startingprice ?? undefined,
		currency: f?.currency || "NPR",
		capacity: f?.capacity ?? 2,
		adults: f?.adults ?? 2,
		children: f?.children ?? 0,
		bedType: f?.bedtype || "—",
		roomSize: f?.roomsize || "—",
		view: f?.view || "—",
		amenities: (f?.amenities ?? "")
			.split(/[\r\n,]+/)
			.map((a) => a.trim())
			.filter(Boolean),
		checkIn: f?.checkin || "2:00 PM",
		checkOut: f?.checkout || "11:00 AM",
		featured: f?.featured ?? false,
		displayOrder: f?.displayorder ?? 0,
	};
}

function mapExperience(
	n: WPItemNode & { experienceFields?: WPExperienceFields | null },
): Experience {
	const f = n.experienceFields;
	const name = clean(n.title);
	const para1 = clean(n.content);
	const paras = [para1, clean(f?.paragraph2), clean(f?.paragraph3)].filter(
		Boolean,
	);
	const activities = (f?.activities ?? "")
		.split("\n")
		.map((a) => a.trim().replace(/^[-•\s]+/, ""))
		.filter(Boolean);
	const photos = wpImages([f?.photo2, f?.photo3], name);
	const mapImg = singleImage(f?.mapimage, name);
	const mapUrl = clean(f?.mapurl);
	return {
		slug: n.slug,
		name,
		excerpt: clean(n.excerpt) || name,
		description: para1,
		featuredImage: nodeImage(n),
		gallery: [],
		paragraphs: paras,
		activities,
		location: clean(f?.location) || undefined,
		photos,
		map: mapImg ? { image: mapImg, url: mapUrl || undefined } : undefined,
		featured: f?.featured ?? false,
	};
}

// ============================================
// QUERIES
// ============================================

const SETTINGS_FIELDS = `
	hotelName tagline subtagline phone secondaryPhone email whatsapp address
	googleMapsUrl googleMapsEmbed latitude longitude
	instagram facebook tripadvisor bookingUrl
	checkIn checkOut currency footerDescription logoUrl
`;

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

// ---------- Page CPTs (one entry per frontend page) ----------
// ACF text field names arrive lowercase via WPGraphQL for ACF.
type WPPageFields = {
	heroeyebrow?: string | null;
	heading?: string | null;
	subheading?: string | null;
	body?: string | null;
	stats?: string | null;
	cards?: string | null;
	etiquette?: string | null;
	bullets?: string | null;
	sidebartitle?: string | null;
	sidebartext?: string | null;
	ctalabel?: string | null;
	ctaurl?: string | null;
	secondaryctalabel?: string | null;
	secondaryctaurl?: string | null;
	faqcategory?: string | null;
	note?: string | null;
	temperature?: string | null;
	hours?: string | null;
	cta?: string | null;
	teaserheading?: string | null;
	teasertext?: string | null;
	teasercta?: string | null;
	teaserctaurl?: string | null;
	images?: { sourceUrl: string; altText: string }[] | null;
	storyeyebrow?: string | null;
	storyheading?: string | null;
	storybody?: string | null;
	storyimage1?: WPImage | null;
	storyimage2?: WPImage | null;
	storystats?: string | null;
	locationheading?: string | null;
	locationtext?: string | null;
	hotelname?: string | null;
	tagline?: string | null;
	subtagline?: string | null;
	heroprimarycta?: string | null;
	heroprimaryctaurl?: string | null;
	herosecondarycta?: string | null;
	herosecondaryctaurl?: string | null;
	footerbackground?: WPImage | null;
	footertagline?: string | null;
	footersubtagline?: string | null;
	footerdescription?: string | null;
	finalctaheading?: string | null;
	finalctadescription?: string | null;
	finalctaimage?: WPImage | null;
	finalctaprimarycta?: string | null;
	finalctaprimaryctaurl?: string | null;
	finalctasecondarycta?: string | null;
	finalctasecondaryctaurl?: string | null;
	diningimage1?: WPImage | null;
	diningimage2?: WPImage | null;
	sustainabilityheading?: string | null;
	sustainabilitytext?: string | null;
	sustainabilityitems?: string | null;
	eventimage1?: WPImage | null;
	eventimage2?: WPImage | null;
	eventcards?: string | null;
	featuresheading?: string | null;
	featureslist?: string | null;
	wellnessimage1?: WPImage | null;
	wellnessimage2?: WPImage | null;
	practicecards?: string | null;
};

type WPPageNode<F extends string> = {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	featuredImage?: { node?: { sourceUrl: string; altText: string } } | null;
} & { [K in F]?: WPPageFields | null };

function clean(s: string | null | undefined): string {
	return s?.replace(/<[^>]*>/g, "").trim() ?? "";
}

function singleImage(
	img: WPImage | null | undefined,
	title: string,
): { url: string; alt: string } | null {
	return img?.sourceUrl
		? { url: wpMedia(img.sourceUrl), alt: img.altText || title }
		: null;
}

function wpImages(
	imgs: (WPImage | null | undefined)[] | null | undefined,
	title: string,
): { url: string; alt: string }[] {
	if (!imgs) return [];
	return imgs
		.filter((i): i is WPImage => !!i?.sourceUrl)
		.map((i) => ({ url: wpMedia(i.sourceUrl), alt: i.altText || title }));
}

function parseStatLines(raw: string | null | undefined): { value: string; label: string }[] {
	if (!raw) return [];
	return raw
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean)
		.map((l) => {
			const [value, ...rest] = l.split("|");
			return { value: value.trim(), label: rest.join("|").trim() };
		})
		.filter((s) => s.value || s.label);
}

function parseCardLines(raw: string | null | undefined): { title: string; text: string }[] {
	if (!raw) return [];
	return raw
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean)
		.map((l) => {
			const [title, ...rest] = l.split("|");
			return { title: title.trim(), text: rest.join("|").trim() };
		})
		.filter((c) => c.title || c.text);
}

function parseLineList(raw: string | null | undefined): string[] {
	if (!raw) return [];
	return raw
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean);
}

function pageImage(
	n: { title: string; featuredImage?: { node?: { sourceUrl: string; altText: string } } | null },
): { url: string; alt: string } {
	return n.featuredImage?.node
		? {
				url: wpMedia(n.featuredImage.node.sourceUrl),
				alt: n.featuredImage.node.altText || n.title,
			}
		: placeholder(n.title);
}

const HOME_PAGE_FIELDS = `
	slug title excerpt content
	featuredImage { node { sourceUrl altText } }
	homePageFields {
		hotelname tagline subtagline
		heroeyebrow heroprimarycta heroprimaryctaurl herosecondarycta herosecondaryctaurl
		storyeyebrow storyheading storybody storyimage1 { sourceUrl altText } storyimage2 { sourceUrl altText } storystats
		locationheading locationtext
		footerbackground { sourceUrl altText } footertagline footersubtagline footerdescription
		finalctaheading finalctadescription finalctaimage { sourceUrl altText }
		finalctaprimarycta finalctaprimaryctaurl finalctasecondarycta finalctasecondaryctaurl
	}
`;

export async function getHomeEntry(): Promise<HomeEntry | null> {
	const data = await wpFetch<{
		homeContentPages: { nodes: WPPageNode<"homePageFields">[] };
	}>(`query { homeContentPages(first: 1) { nodes { ${HOME_PAGE_FIELDS} } } }`);
	const n = data?.homeContentPages?.nodes?.[0];
	if (!n) return null;
	const f = n.homePageFields;
	const storyImages = wpImages(
		[f?.storyimage1, f?.storyimage2],
		n.title,
	);
	const footerBg = singleImage(f?.footerbackground, n.title);
	const finalImage =
		singleImage(f?.finalctaimage, n.title) ?? placeholder(n.title);
	return {
		hotelName: f?.hotelname || n.title,
		tagline: f?.tagline || "",
		subtagline: f?.subtagline || clean(n.excerpt),
		heroEyebrow: f?.heroeyebrow || "",
		heroImage: pageImage(n),
		heroPrimaryCta: f?.heroprimarycta || "Book Your Stay",
		heroPrimaryCtaUrl: f?.heroprimaryctaurl || "/booking",
		heroSecondaryCta: f?.herosecondarycta || "Explore the Hotel",
		heroSecondaryCtaUrl: f?.herosecondaryctaurl || "/stay",
		storyEyebrow: f?.storyeyebrow || "Our Story",
		storyHeading: f?.storyheading || "",
		storyBody: f?.storybody || clean(n.content),
		storyImages:
			storyImages.length >= 2
				? storyImages
				: [...storyImages, ...Array(2 - storyImages.length).fill(placeholder(n.title))],
		storyStats: parseStatLines(f?.storystats),
		locationHeading: f?.locationheading || "",
		locationText: f?.locationtext || "",
		footerBackground: footerBg ?? undefined,
		footerTagline: f?.footertagline || f?.tagline || "",
		footerSubtagline: f?.footersubtagline || f?.subtagline || "",
		footerDescription: f?.footerdescription || "",
		finalCtaHeading: f?.finalctaheading || "",
		finalCtaDescription: f?.finalctadescription || "",
		finalCtaImage: finalImage,
		finalCtaPrimaryCta: f?.finalctaprimarycta || "Book Your Stay",
		finalCtaPrimaryCtaUrl: f?.finalctaprimaryctaurl || "/booking",
		finalCtaSecondaryCta: f?.finalctasecondarycta || "Contact Us",
		finalCtaSecondaryCtaUrl: f?.finalctasecondaryctaurl || "/contact",
	};
}

const STAY_PAGE_FIELDS = `
	slug title excerpt content
	stayPageFields {
		heroeyebrow heading subheading
		sidebartext ctalabel ctaurl secondaryctalabel secondaryctaurl
	}
`;

export async function getStayPage(): Promise<StayPage | null> {
	const data = await wpFetch<{
		stayPages: { nodes: WPPageNode<"stayPageFields">[] };
	}>(`query { stayPages(first: 1) { nodes { ${STAY_PAGE_FIELDS} } } }`);
	const n = data?.stayPages?.nodes?.[0];
	if (!n) return null;
	const f = n.stayPageFields;
	return {
		eyebrow: f?.heroeyebrow || "Stay",
		heading: f?.heading || "",
		subheading: f?.subheading || clean(n.content) || clean(n.excerpt),
		sidebarText: f?.sidebartext || "",
		ctaLabel: f?.ctalabel || "Check Availability",
		ctaUrl: f?.ctaurl || "/booking",
		secondaryCtaLabel: f?.secondaryctalabel || "Ask a Question",
		secondaryCtaUrl: f?.secondaryctaurl || "/contact",
	};
}

const HOT_SPRING_PAGE_FIELDS = `
	slug title excerpt content
	featuredImage { node { sourceUrl altText } }
	hotSpringPageFields {
		heroeyebrow heading subheading teaserheading teasertext
		temperature hours bullets body cards etiquette
		sidebartitle sidebartext ctalabel ctaurl cta teaserctaurl faqcategory
	}
`;

export async function getHotSpringPage(): Promise<HotSpringPage | null> {
	const data = await wpFetch<{
		hotSpringPages: { nodes: WPPageNode<"hotSpringPageFields">[] };
	}>(`query { hotSpringPages(first: 1) { nodes { ${HOT_SPRING_PAGE_FIELDS} } } }`);
	const n = data?.hotSpringPages?.nodes?.[0];
	if (!n) return null;
	const f = n.hotSpringPageFields;
	return {
		eyebrow: f?.heroeyebrow || "Hot Spring",
		heading: f?.heading || "",
		subheading: f?.subheading || clean(n.content),
		heroImage: pageImage(n),
		teaserHeading: f?.teaserheading || "",
		teaserText: f?.teasertext || clean(n.excerpt),
		temperature: f?.temperature || "",
		hours: f?.hours || "",
		bullets: parseLineList(f?.bullets),
		body: f?.body || "",
		cards: parseCardLines(f?.cards),
		etiquette: parseLineList(f?.etiquette),
		sidebarTitle: f?.sidebartitle || "",
		sidebarText: f?.sidebartext || "",
		ctaLabel: f?.ctalabel || "",
		ctaUrl: f?.ctaurl || "/booking",
		teaserCta: f?.cta || "",
		teaserCtaUrl: f?.teaserctaurl || "/hot-spring",
		faqCategory: f?.faqcategory || "Hot Spring",
	};
}

const EXPERIENCES_PAGE_FIELDS = `
	slug title excerpt content
	experiencesPageFields {
		heroeyebrow heading subheading sidebartitle sidebartext ctalabel ctaurl
	}
`;

export async function getExperiencesPage(): Promise<ExperiencesPage | null> {
	const data = await wpFetch<{
		experiencesPages: { nodes: WPPageNode<"experiencesPageFields">[] };
	}>(`query { experiencesPages(first: 1) { nodes { ${EXPERIENCES_PAGE_FIELDS} } } }`);
	const n = data?.experiencesPages?.nodes?.[0];
	if (!n) return null;
	const f = n.experiencesPageFields;
	return {
		eyebrow: f?.heroeyebrow || "Experiences",
		heading: f?.heading || "",
		subheading: f?.subheading || clean(n.content),
		sidebarTitle: f?.sidebartitle || "",
		sidebarText: f?.sidebartext || "",
		ctaLabel: f?.ctalabel || "Enquire to Book",
		ctaUrl: f?.ctaurl || "/booking",
	};
}

const DINING_PAGE_FIELDS = `
	slug title excerpt content
	diningPageFields {
		heroeyebrow heading subheading teaserheading teasertext
		diningimage1 { sourceUrl altText } diningimage2 { sourceUrl altText } cta teaserctaurl
	}
`;

export async function getDiningPage(): Promise<DiningPage | null> {
	const data = await wpFetch<{
		diningPages: {
			nodes: (WPPageNode<"diningPageFields"> & {
				mealsList: { title: string; text: string }[];
			})[];
		};
	}>(
		`query { diningPages(first: 1) { nodes { ${DINING_PAGE_FIELDS} mealsList { title text } } } }`,
	);
	const n = data?.diningPages?.nodes?.[0];
	if (!n) return null;
	const f = n.diningPageFields;
	const images = wpImages([f?.diningimage1, f?.diningimage2], n.title);
	return {
		eyebrow: f?.heroeyebrow || "Dining",
		heading: f?.heading || "",
		subheading: f?.subheading || clean(n.content),
		teaserHeading: f?.teaserheading || f?.heading || "",
		teaserText: f?.teasertext || clean(n.excerpt),
		images:
			images.length >= 2
				? images
				: [...images, ...Array(2 - images.length).fill(placeholder(n.title))],
		cards: (n.mealsList ?? [])
			.map((m) => ({ title: m.title, text: m.text }))
			.filter((c) => c.title || c.text),
		teaserCta: f?.cta || "Explore Dining",
		teaserCtaUrl: f?.teaserctaurl || "/dining",
	};
}

const EVENTS_PAGE_FIELDS = `
	slug title excerpt content
	featuredImage { node { sourceUrl altText } }
	eventsPageFields {
		heroeyebrow heading subheading teaserheading teasertext
		eventimage1 { sourceUrl altText } eventimage2 { sourceUrl altText }
		teasercta teaserctaurl eventcards featuresheading featureslist
	}
`;

export async function getEventsPage(): Promise<EventsPage | null> {
	const data = await wpFetch<{
		eventsPages: { nodes: WPPageNode<"eventsPageFields">[] };
	}>(`query { eventsPages(first: 1) { nodes { ${EVENTS_PAGE_FIELDS} } } }`);
	const n = data?.eventsPages?.nodes?.[0];
	if (!n) return null;
	const f = n.eventsPageFields;
	const images = wpImages([f?.eventimage1, f?.eventimage2], n.title);
	return {
		eyebrow: f?.heroeyebrow || "Events",
		heading: f?.heading || "",
		subheading: f?.subheading || clean(n.content),
		teaserHeading: f?.teaserheading || f?.heading || "",
		teaserText: f?.teasertext || clean(n.excerpt),
		images:
			images.length >= 2
				? images
				: [...images, ...Array(2 - images.length).fill(placeholder(n.title))],
		teaserCta: f?.teasercta || "Explore Events",
		teaserCtaUrl: f?.teaserctaurl || "/events",
		cards: parseCardLines(f?.eventcards),
		featuresHeading: clean(f?.featuresheading),
		features: (f?.featureslist ?? "")
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter(Boolean),
	};
}

const WELLNESS_PAGE_FIELDS = `
	slug title excerpt content
	featuredImage { node { sourceUrl altText } }
	wellnessPageFields {
		heroeyebrow heading subheading teaserheading teasertext
		wellnessimage1 { sourceUrl altText } wellnessimage2 { sourceUrl altText }
		teasercta teaserctaurl practicecards
	}
`;

export async function getWellnessPage(): Promise<WellnessPage | null> {
	const data = await wpFetch<{
		wellnessPages: { nodes: WPPageNode<"wellnessPageFields">[] };
	}>(`query { wellnessPages(first: 1) { nodes { ${WELLNESS_PAGE_FIELDS} } } }`);
	const n = data?.wellnessPages?.nodes?.[0];
	if (!n) return null;
	const f = n.wellnessPageFields;
	const images = wpImages([f?.wellnessimage1, f?.wellnessimage2], n.title);
	return {
		eyebrow: f?.heroeyebrow || "Wellness",
		heading: f?.heading || "",
		subheading: f?.subheading || clean(n.content),
		teaserHeading: f?.teaserheading || f?.heading || "",
		teaserText: f?.teasertext || clean(n.excerpt),
		images:
			images.length >= 2
				? images
				: [...images, ...Array(2 - images.length).fill(placeholder(n.title))],
		teaserCta: f?.teasercta || "Explore Wellness",
		teaserCtaUrl: f?.teaserctaurl || "/wellness",
		cards: parseCardLines(f?.practicecards),
	};
}

const GALLERY_PAGE_FIELDS = `
	slug title excerpt content
	galleryPageFields { heroeyebrow heading subheading }
`;

export async function getGalleryPage(): Promise<GalleryPage | null> {
	const data = await wpFetch<{
		galleryPages: { nodes: WPPageNode<"galleryPageFields">[] };
	}>(`query { galleryPages(first: 1) { nodes { ${GALLERY_PAGE_FIELDS} } } }`);
	const n = data?.galleryPages?.nodes?.[0];
	if (!n) return null;
	const f = n.galleryPageFields;
	return {
		eyebrow: f?.heroeyebrow || "Gallery",
		heading: f?.heading || "",
		subheading: f?.subheading || "",
	};
}

const ABOUT_PAGE_FIELDS = `
	slug title excerpt content
	featuredImage { node { sourceUrl altText } }
	aboutPageFields {
		heroeyebrow heading stats
		sustainabilityheading sustainabilitytext sustainabilityitems faqcategory
	}
`;

export async function getAboutPage(): Promise<AboutPage | null> {
	const data = await wpFetch<{
		aboutPages: { nodes: WPPageNode<"aboutPageFields">[] };
	}>(`query { aboutPages(first: 1) { nodes { ${ABOUT_PAGE_FIELDS} } } }`);
	const n = data?.aboutPages?.nodes?.[0];
	if (!n) return null;
	const f = n.aboutPageFields;
	return {
		eyebrow: f?.heroeyebrow || "About",
		heading: f?.heading || n.title,
		body: clean(n.content),
		image: pageImage(n),
		stats: parseStatLines(f?.stats),
		sustainabilityHeading: clean(f?.sustainabilityheading),
		sustainabilityText: clean(f?.sustainabilitytext),
		sustainabilityItems: parseCardLines(f?.sustainabilityitems),
		faqCategory: clean(f?.faqcategory) || "About",
	};
}

const CONTACT_PAGE_FIELDS = `
	slug title excerpt content
	contactPageFields { heroeyebrow heading subheading sidebartitle }
`;

export async function getContactPage(): Promise<ContactPage | null> {
	const data = await wpFetch<{
		contactPages: { nodes: WPPageNode<"contactPageFields">[] };
	}>(`query { contactPages(first: 1) { nodes { ${CONTACT_PAGE_FIELDS} } } }`);
	const n = data?.contactPages?.nodes?.[0];
	if (!n) return null;
	const f = n.contactPageFields;
	return {
		eyebrow: f?.heroeyebrow || "Contact",
		heading: f?.heading || n.title,
		subheading: f?.subheading || "",
		sidebarTitle: f?.sidebartitle || "Send a message",
	};
}

const ROOM_FIELDS = `
	slug title excerpt content
	featuredImage { node { sourceUrl altText } }
		roomFields {
			startingprice currency capacity adults children
			bedtype roomsize view amenities checkin checkout
			galleryimage1 { sourceUrl altText }
			galleryimage2 { sourceUrl altText }
			galleryimage3 { sourceUrl altText }
			featured displayorder
		}
`;

export async function getRooms(): Promise<Room[]> {
	const data = await wpFetch<{
		rooms: { nodes: (WPItemNode & { roomFields?: WPRoomFields | null })[] };
	}>(`query { rooms(first: 100, where: { status: PUBLISH }) { nodes { ${ROOM_FIELDS} } } }`);
	const nodes = data?.rooms?.nodes;
	if (!nodes) return withFallback(null, mockRooms, "getRooms");
	if (nodes.length === 0) return [];
	return nodes
		.filter((n) => n.slug && n.title)
		.map(mapRoom)
		.sort((a, b) => a.displayOrder - b.displayOrder);
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
	const data = await wpFetch<{
		experiences: {
			nodes: (WPItemNode & { experienceFields?: WPExperienceFields | null })[];
		};
	}>(
		`query {
			experiences(first: 100, where: { status: PUBLISH }) {
				nodes {
					slug title excerpt content
					featuredImage { node { sourceUrl altText } }
					experienceFields {
						paragraph2 paragraph3 activities location
						photo2 { sourceUrl altText } photo3 { sourceUrl altText }
						mapimage { sourceUrl altText } mapurl featured
					}
				}
			}
		}`,
	);
	const nodes = data?.experiences?.nodes;
	if (!nodes) return withFallback(null, mockExperiences, "getExperiences");
	if (nodes.length === 0) return [];
	return nodes.filter((n) => n.slug && n.title).map(mapExperience);
}

export async function getExperienceBySlug(
	slug: string,
): Promise<Experience | null> {
	const ex = await getExperiences();
	return ex.find((e) => e.slug === slug) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
	const data = await wpFetch<{
		testimonials: {
			nodes: (WPItemNode & { testimonialFields?: WPTestimonialFields | null })[];
		};
	}>(
		`query {
			testimonials(first: 100, where: { status: PUBLISH }) {
				nodes {
					slug title excerpt content
					testimonialFields {
						guestname guestlocation quote rating featured
					}
				}
			}
		}`,
	);
	const nodes = data?.testimonials?.nodes;
	if (!nodes) return withFallback(null, mockTestimonials, "getTestimonials");
	if (nodes.length === 0) return [];
	return nodes
		.map((n) => {
			const f = n.testimonialFields;
			const name = f?.guestname || clean(n.title);
			return {
				guestName: name,
				guestLocation: f?.guestlocation || "",
				quote: f?.quote || clean(n.content) || clean(n.excerpt),
				rating: f?.rating ?? 5,
				featured: f?.featured ?? true,
			};
		})
		.filter((r) => r.guestName && r.quote);
}

export async function getGallery(): Promise<GalleryItem[]> {
	const data = await wpFetch<{
		galleryItems: {
			nodes: (WPItemNode & { galleryItemFields?: WPGalleryItemFields | null })[];
		};
	}>(
		`query {
			galleryItems(first: 200, where: { status: PUBLISH }) {
				nodes {
					slug title excerpt content
					featuredImage { node { sourceUrl altText } }
					galleryItemFields { category caption displayorder }
				}
			}
		}`,
	);
	const nodes = data?.galleryItems?.nodes;
	if (!nodes) return withFallback(null, mockGallery, "getGallery");
	if (nodes.length === 0) return [];
	return nodes
		.map((n, i) => {
			const f = n.galleryItemFields;
			const title = clean(n.title);
			return {
				image: nodeImage(n),
				category: f?.category || "Hotel",
				caption: f?.caption || title,
				displayOrder: f?.displayorder ?? i,
			};
		})
		.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getFaqs(): Promise<FAQ[]> {
	const data = await wpFetch<{
		faqs: { nodes: (WPItemNode & { faqFields?: WPFAQFields | null })[] };
	}>(
		`query {
			faqs(first: 200, where: { status: PUBLISH }) {
				nodes {
					slug title excerpt content
					faqFields { question answer category displayorder }
				}
			}
		}`,
	);
	const nodes = data?.faqs?.nodes;
	if (!nodes) return withFallback(null, mockFaqs, "getFaqs");
	if (nodes.length === 0) return [];
	return nodes
		.map((n, i) => {
			const f = n.faqFields;
			return {
				question: f?.question || clean(n.title),
				answer: f?.answer || clean(n.content),
				category: f?.category || "General",
				displayOrder: f?.displayorder ?? i,
			};
		})
		.filter((r) => r.question && r.answer)
		.sort((a, b) => a.displayOrder - b.displayOrder);
}
