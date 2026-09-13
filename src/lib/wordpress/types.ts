export type Media = {
	url: string;
	alt: string;
	width?: number;
	height?: number;
};

export type Room = {
	slug: string;
	name: string;
	excerpt: string;
	description: string;
	featuredImage: Media;
	gallery: Media[];
	startingPrice?: number;
	currency?: string;
	capacity: number;
	adults: number;
	children: number;
	bedType: string;
	roomSize: string;
	view: string;
	amenities: string[];
	checkIn?: string;
	checkOut?: string;
	featured: boolean;
	displayOrder: number;
};

export type Experience = {
	slug: string;
	name: string;
	excerpt: string;
	description: string;
	featuredImage: Media;
	gallery: Media[];
	duration?: string;
	difficulty?: string;
	season?: string;
	price?: number;
	featured: boolean;
};

export type Testimonial = {
	guestName: string;
	guestLocation: string;
	quote: string;
	rating?: number;
	image?: Media;
	featured: boolean;
};

export type GalleryItem = {
	image: Media;
	category: string;
	caption?: string;
	displayOrder: number;
};

export type FAQ = {
	question: string;
	answer: string;
	category: string;
	displayOrder: number;
};

export type HotelSettings = {
	hotelName: string;
	tagline: string;
	subtagline: string;
	phone: string;
	secondaryPhone?: string;
	email: string;
	whatsapp?: string;
	address: string;
	googleMapsUrl: string;
	googleMapsEmbed: string;
	latitude?: string;
	longitude?: string;
	instagram?: string;
	facebook?: string;
	tripadvisor?: string;
	bookingUrl?: string;
	checkIn: string;
	checkOut: string;
	currency: string;
	footerDescription: string;
};

// Home Content CPT entry (slug: home) — homepage + footer identity.
export type HomeEntry = {
	hotelName: string;
	tagline: string;
	subtagline: string;
	heroEyebrow: string;
	heroImage: Media;
	heroPrimaryCta: string;
	heroPrimaryCtaUrl: string;
	heroSecondaryCta: string;
	heroSecondaryCtaUrl: string;
	storyEyebrow: string;
	storyHeading: string;
	storyBody: string;
	storyImages: Media[];
	storyStats: { value: string; label: string }[];
	locationHeading: string;
	locationText: string;
	footerBackground?: Media;
	footerTagline: string;
	footerSubtagline: string;
	finalCtaHeading: string;
	finalCtaDescription: string;
	finalCtaImage: Media;
	finalCtaPrimaryCta: string;
	finalCtaPrimaryCtaUrl: string;
	finalCtaSecondaryCta: string;
	finalCtaSecondaryCtaUrl: string;
};

// Per-page CPT entries. Lists (rooms, experiences, gallery…) always come
// from their item CPTs; these hold each page's hero + sections.
export type StayPage = {
	eyebrow: string;
	heading: string;
	subheading: string;
	sidebarText: string;
	ctaLabel: string;
	ctaUrl: string;
	secondaryCtaLabel: string;
	secondaryCtaUrl: string;
};

export type HotSpringPage = {
	eyebrow: string;
	heading: string;
	subheading: string;
	heroImage: Media;
	teaserHeading: string;
	teaserText: string;
	temperature: string;
	hours: string;
	bullets: string[];
	body: string;
	cards: { title: string; text: string }[];
	etiquette: string[];
	sidebarTitle: string;
	sidebarText: string;
	ctaLabel: string;
	ctaUrl: string;
	teaserCta: string;
	teaserCtaUrl: string;
	faqCategory: string;
};

export type ExperiencesPage = {
	eyebrow: string;
	heading: string;
	subheading: string;
	sidebarTitle: string;
	sidebarText: string;
	ctaLabel: string;
	ctaUrl: string;
};

export type DiningPage = {
	eyebrow: string;
	heading: string;
	subheading: string;
	teaserHeading: string;
	teaserText: string;
	images: Media[];
	cards: { title: string; text: string }[];
	teaserCta: string;
	teaserCtaUrl: string;
};

export type GalleryPage = {
	eyebrow: string;
	heading: string;
	subheading: string;
};

export type AboutPage = {
	eyebrow: string;
	heading: string;
	body: string;
	image: Media;
	stats: { value: string; label: string }[];
};

export type ContactPage = {
	eyebrow: string;
	heading: string;
	subheading: string;
	sidebarTitle: string;
};

