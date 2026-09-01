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

export type HomeContent = {
	hero: {
		eyebrow: string;
		heading: string;
		subheading: string;
		image: Media;
		primaryCta: string;
		secondaryCta: string;
	};
	intro: { heading: string; body: string; images: Media[] };
	hotSpring: {
		heading: string;
		text: string;
		image: Media;
		temperature?: string;
		hours?: string;
		cta: string;
	};
	dining: { heading: string; text: string; images: Media[]; cta: string };
	finalCta: { heading: string; description: string; image: Media };
};

export type Offer = {
	slug: string;
	title: string;
	description: string;
	image: Media;
	price?: string;
	validity?: string;
	terms?: string;
	featured: boolean;
};
