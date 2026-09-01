import type {
	Experience,
	FAQ,
	GalleryItem,
	HomeContent,
	HotelSettings,
	Offer,
	Room,
	Testimonial,
} from "./types";

// Curated Himalayan / nature / onsen imagery — not random picsum
const curated = {
	hero: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", // snow Himalaya
	intro1: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", // timber lodge interior
	intro2: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000", // forest + cabin
	hotSpring: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", // steaming onsen stone bath
	dining1: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0", // mountain table
	dining2: "https://images.unsplash.com/photo-1559339352-11d035aa65de", // Nepali dal / wood
	finalCta: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e", // misty ridge dawn
	room1: "https://images.unsplash.com/photo-1566665797739-1674de7a421a", // suite timber
	room2: "https://images.unsplash.com/photo-1590490360182-c33d57733427", // deluxe queen
	room3: "https://images.unsplash.com/photo-1611892440504-42a792e24d32", // family
	room4: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", // riverside calm
	exp1: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992", // hot spring bathing
	exp2: "https://images.unsplash.com/photo-1551632811-561732d1e306", // mountain walks
	exp3: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084", // village
	exp4: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", // riverside
	exp5: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4", // bonfire
	exp6: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", // viewpoint
	galleryHotel: "https://images.unsplash.com/photo-1445019980597-93fa8ac97c40",
	gallerySpring: "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
	galleryRoom: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
	galleryNature: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
	galleryDining: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
	galleryExp: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084",
};

const img = (url: string, w = 1200, h = 800, alt: string) => ({
	url: `${url}?auto=format&fit=crop&w=${w}&h=${h}&q=80`,
	alt,
	width: w,
	height: h,
});

export const mockSettings: HotelSettings = {
	hotelName: "Shrestha Hotel Hotspring",
	tagline: "Where the Mountains Meet Warm Waters",
	phone: "+977 9800000000",
	email: "namaste@shresthahotel.com",
	whatsapp: "+9779800000000",
	address: "Beni, Myagdi, Gandaki Province, Nepal",
	googleMapsUrl: "https://maps.google.com/?q=Beni+Myagdi+Nepal",
	googleMapsEmbed:
		"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3519!2d83.5!3d28.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBeni%20Myagdi!5e0!3m2!1sen!2snp!4v1700000000000",
	latitude: "28.3417",
	longitude: "83.5603",
	instagram: "https://instagram.com/",
	facebook: "https://facebook.com/",
	tripadvisor: "https://tripadvisor.com/",
	bookingUrl: "/booking",
	checkIn: "2:00 PM",
	checkOut: "11:00 AM",
	currency: "NPR",
	footerDescription:
		"A peaceful Himalayan retreat shaped by nature, warm hospitality, and restorative natural hot springs in the heart of Myagdi.",
};

export const mockHome: HomeContent = {
	hero: {
		eyebrow: "SHRESTHA HOTEL HOTSPRING",
		heading: "Where the Mountains\nMeet Warm Waters",
		subheading:
			"A peaceful Himalayan retreat shaped by nature, warm hospitality, and restorative natural hot springs.",
		image: img(
			curated.hero,
			1920,
			1080,
			"Himalayan mountains at dawn — Myagdi",
		),
		primaryCta: "Book Your Stay",
		secondaryCta: "Explore the Hotel",
	},
	intro: {
		heading: "Come for the mountains.\nStay for the warmth.",
		body: "Nestled in the quiet folds of Myagdi, Shrestha Hotel Hotspring is a small, soulful retreat where forest air, stone and timber, and the hush of warm water set the rhythm of each day. Here, mornings begin with mist over the ridges and evenings end in the quiet glow of the hot spring — a place to slow down, breathe deeper, and feel held by the mountains.",
		images: [
			img(curated.intro1, 800, 1000, "Timber lodge interior with warm light"),
			img(curated.intro2, 800, 600, "Pine forest and stone path"),
		],
	},
	hotSpring: {
		heading: "Nature's\nWarmest Welcome",
		text: "Our natural hot spring is the heart of the hotel — mineral-rich waters gathered from deep Himalayan stone, held at a gentle warmth for slow, restorative bathing. Surrounded by timber, steam and forest light, it's a place for quiet restoration, shared silence, and the simple luxury of water that has traveled through the mountain to reach you.",
		image: img(
			curated.hotSpring,
			1400,
			900,
			"Stone-lined hot spring with steam at dawn",
		),
		temperature: "38–42°C",
		hours: "6:00 AM — 9:00 PM",
		cta: "Discover the Hot Spring",
	},
	dining: {
		heading: "From the Mountains\nto the Table",
		text: "Food here follows the land — fresh, seasonal, and cooked with care. Warm dal and gundruk from nearby farms, wood-fired breads, mountain herbs, and Nepali hospitality served without hurry. Dine looking out to the valley, or by the fire when the evening turns cool.",
		images: [
			img(curated.dining1, 700, 900, "Mountain dining table with valley view"),
			img(curated.dining2, 700, 700, "Nepali dal and wood-fired bread"),
		],
		cta: "Explore Dining",
	},
	finalCta: {
		heading: "Your Mountain Escape Awaits",
		description:
			"Let the hot spring hold the day's quiet. Let the mountains do the rest.",
		image: img(curated.finalCta, 1920, 900, "Misty Himalayan ridge at sunrise"),
	},
};

export const mockRooms: Room[] = [
	{
		slug: "forest-retreat-suite",
		name: "Forest Retreat Suite",
		excerpt: "Timber, stone and valley light — our most private suite.",
		description:
			"A generous corner suite wrapped in timber and linen, with a private balcony facing the forested ridge. Stone bath, warm wood floors, and quiet mornings with tea as mist lifts from the valley. Designed for lingering.",
		featuredImage: img(
			curated.room1,
			1200,
			800,
			"Forest Retreat Suite — timber and linen",
		),
		gallery: [
			img(curated.room1, 1200, 800, "Forest suite"),
			img(curated.intro1, 1200, 800, "Timber detail"),
			img(curated.intro2, 1200, 800, "Forest view"),
		],
		startingPrice: 18500,
		currency: "NPR",
		capacity: 2,
		adults: 2,
		children: 1,
		bedType: "King Bed",
		roomSize: "38 m²",
		view: "Forest & Valley View",
		amenities: [
			"Mountain View",
			"Hot Spring Access",
			"Private Bathroom",
			"Heating",
			"Balcony",
			"Wi-Fi",
			"Garden View",
		],
		checkIn: "2:00 PM",
		checkOut: "11:00 AM",
		featured: true,
		displayOrder: 1,
	},
	{
		slug: "hotspring-deluxe",
		name: "Hotspring Deluxe",
		excerpt: "Steps from the spring — warmth, whenever you want it.",
		description:
			"Closest to the hot spring baths, this warm, grounded room pairs oak details with soft cream linen. Ideal for guests who come for the water and stay for the quiet. Private sit-out with valley glimpses.",
		featuredImage: img(
			curated.room2,
			1200,
			800,
			"Hotspring Deluxe — queen bed and oak",
		),
		gallery: [
			img(curated.room2, 1200, 800, "Deluxe room"),
			img(curated.hotSpring, 1200, 800, "Spring view"),
		],
		startingPrice: 14500,
		currency: "NPR",
		capacity: 2,
		adults: 2,
		children: 1,
		bedType: "Queen Bed",
		roomSize: "28 m²",
		view: "Garden & Spring View",
		amenities: [
			"Hot Spring Access",
			"Mountain View",
			"Private Bathroom",
			"Heating",
			"Wi-Fi",
			"Room Service",
		],
		checkIn: "2:00 PM",
		checkOut: "11:00 AM",
		featured: true,
		displayOrder: 2,
	},
	{
		slug: "mountain-family-retreat",
		name: "Mountain Family Retreat",
		excerpt: "Space for togetherness, framed by the Himalayas.",
		description:
			"Two connected spaces, warm timber bunk and a king bed, with room for small travelers and quiet corners for tea. Large windows bring the ridge inside. Interconnecting option available.",
		featuredImage: img(curated.room3, 1200, 800, "Family retreat with bunk"),
		gallery: [img(curated.room3, 1200, 800, "Family room")],
		startingPrice: 22000,
		currency: "NPR",
		capacity: 4,
		adults: 3,
		children: 2,
		bedType: "King + Bunk",
		roomSize: "45 m²",
		view: "Mountain Panorama",
		amenities: [
			"Family Rooms",
			"Mountain View",
			"Hot Spring Access",
			"Heating",
			"Balcony",
			"Wi-Fi",
		],
		checkIn: "2:00 PM",
		checkOut: "11:00 AM",
		featured: true,
		displayOrder: 3,
	},
	{
		slug: "riverside-calm",
		name: "Riverside Calm",
		excerpt: "Intimate, quiet — the sound of water nearby.",
		description:
			"A small, deeply calm room near the riverside walk. Perfect for solo travelers or couples seeking simplicity: warm blanket, good book, balcony chair and the evening sound of water.",
		featuredImage: img(
			curated.room4,
			1200,
			800,
			"Riverside Calm — quiet queen room",
		),
		gallery: [img(curated.room4, 1200, 800, "Riverside")],
		startingPrice: 11500,
		currency: "NPR",
		capacity: 2,
		adults: 2,
		children: 0,
		bedType: "Queen Bed",
		roomSize: "24 m²",
		view: "River & Forest",
		amenities: ["Hot Spring Access", "Private Bathroom", "Wi-Fi", "Heating"],
		checkIn: "2:00 PM",
		checkOut: "11:00 AM",
		featured: false,
		displayOrder: 4,
	},
];

export const mockExperiences: Experience[] = [
	{
		slug: "natural-hot-spring",
		name: "Natural Hot Spring Bathing",
		excerpt: "Mineral-rich waters held at a gentle warmth.",
		description:
			"The spring is the hotel's quiet center. Bathe at dawn when steam lifts into forest light, or after a walk when legs are tired. Indoor and open-air pools, stone-lined, with space for silence.",
		featuredImage: img(curated.exp1, 800, 600, "Hot spring bathing"),
		gallery: [img(curated.exp1, 800, 600, "Spring")],
		duration: "Open daily 6AM–9PM",
		difficulty: "Easy",
		season: "Year-round",
		featured: true,
	},
	{
		slug: "mountain-walks",
		name: "Mountain Walks",
		excerpt: "Unmarked trails through rhododendron and pine.",
		description:
			"Guided or self-led walks from the hotel gate — ridge viewpoints, village paths and forest loops. Mornings are clearest.",
		featuredImage: img(curated.exp2, 800, 600, "Mountain walks through pine"),
		gallery: [img(curated.exp2, 800, 600, "Trail")],
		duration: "1–4 hours",
		difficulty: "Easy to Moderate",
		season: "Sep–May best",
		featured: true,
	},
	{
		slug: "village-exploration",
		name: "Village Exploration",
		excerpt: "Tea houses, terraced fields and unhurried conversation.",
		description:
			"Walk to nearby villages, meet makers and farmers, taste local milks and honeys. A gentle immersion in Myagdi life.",
		featuredImage: img(curated.exp3, 800, 600, "Village terraces"),
		gallery: [img(curated.exp3, 800, 600, "Village")],
		duration: "2–3 hours",
		difficulty: "Easy",
		season: "Year-round",
		featured: true,
	},
	{
		slug: "riverside-relaxation",
		name: "Riverside Relaxation",
		excerpt: "Sit by the Kali Gandaki's quiet stretches.",
		description:
			"A short walk to river stones and shade. Bring tea, a book, or nothing at all.",
		featuredImage: img(curated.exp4, 800, 600, "Riverside stones"),
		gallery: [img(curated.exp4, 800, 600, "River")],
		duration: "Flexible",
		difficulty: "Easy",
		season: "Year-round",
		featured: false,
	},
	{
		slug: "bonfire-evenings",
		name: "Bonfire Evenings",
		excerpt: "Firelight, stories and warm plates shared outside.",
		description:
			"When the evening cools, we gather by the fire — music, tea, and mountain air.",
		featuredImage: img(curated.exp5, 800, 600, "Bonfire evening"),
		gallery: [img(curated.exp5, 800, 600, "Fire")],
		duration: "Evenings",
		difficulty: "Easy",
		season: "Oct–Apr",
		featured: true,
	},
	{
		slug: "scenic-viewpoints",
		name: "Scenic Viewpoints",
		excerpt: "Wide horizons, best at sunrise.",
		description:
			"Short drives to viewpoints over Dhaulagiri and Annapurna on clear days.",
		featuredImage: img(curated.exp6, 800, 600, "Mountain viewpoint"),
		gallery: [img(curated.exp6, 800, 600, "View")],
		duration: "Half-day",
		difficulty: "Easy",
		season: "Oct–Apr",
		featured: false,
	},
];

export const mockTestimonials: Testimonial[] = [
	{
		guestName: "Aarav & Meera",
		guestLocation: "Kathmandu, Nepal",
		quote:
			"We came for the hot spring and stayed for the quiet. The kind of place that slows your breath without asking you to.",
		rating: 5,
		featured: true,
	},
	{
		guestName: "Sophie L.",
		guestLocation: "Lyon, France",
		quote:
			"Warm water under open sky, forest all around, and staff who remember how you take your tea. Perfect.",
		rating: 5,
		featured: true,
	},
	{
		guestName: "Rajesh K.",
		guestLocation: "Pokhara, Nepal",
		quote:
			"Clean, calm, deeply Nepali in its hospitality. The rooms feel like a mountain home, not a hotel.",
		rating: 5,
		featured: true,
	},
];

export const mockGallery: GalleryItem[] = [
	{
		image: img(
			curated.galleryHotel,
			800,
			1000,
			"Timber and stone lobby at dusk",
		),
		category: "Hotel",
		caption: "Timber and stone lobby at dusk",
		displayOrder: 1,
	},
	{
		image: img(curated.gallerySpring, 1000, 700, "Steam rising at dawn"),
		category: "Hot Spring",
		caption: "Steam rising at dawn",
		displayOrder: 2,
	},
	{
		image: img(curated.galleryRoom, 800, 800, "Forest Retreat Suite"),
		category: "Rooms",
		caption: "Forest Retreat Suite",
		displayOrder: 3,
	},
	{
		image: img(curated.galleryNature, 1000, 1200, "Misty ridge morning"),
		category: "Nature",
		caption: "Misty ridge morning",
		displayOrder: 4,
	},
	{
		image: img(curated.galleryDining, 800, 600, "Wood-fired bread and dal"),
		category: "Dining",
		caption: "Wood-fired bread and dal",
		displayOrder: 5,
	},
	{
		image: img(curated.galleryExp, 800, 1000, "Village walk"),
		category: "Experiences",
		caption: "Village walk",
		displayOrder: 6,
	},
	{
		image: img(curated.exp4, 1000, 700, "River stones"),
		category: "Nature",
		caption: "River stones",
		displayOrder: 7,
	},
	{
		image: img(curated.exp1, 800, 800, "Open-air bath"),
		category: "Hot Spring",
		caption: "Open-air bath",
		displayOrder: 8,
	},
];

export const mockFaqs: FAQ[] = [
	{
		question: "Is the hot spring natural?",
		answer:
			"Yes — mineral-rich water sourced from deep Himalayan springs, maintained at 38–42°C for comfortable bathing.",
		category: "Hot Spring",
		displayOrder: 1,
	},
	{
		question: "Who can use the hot spring?",
		answer:
			"All staying guests have complimentary access. Please shower before entering and follow posted etiquette.",
		category: "Hot Spring",
		displayOrder: 2,
	},
	{
		question: "What are check-in and check-out times?",
		answer:
			"Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in/late check-out on request, subject to availability.",
		category: "Stay",
		displayOrder: 3,
	},
	{
		question: "Is the hotel suitable for families?",
		answer:
			"Yes — we have family rooms and interconnecting options. Please mention children's ages when booking.",
		category: "Stay",
		displayOrder: 4,
	},
];

export const mockOffers: Offer[] = [
	{
		slug: "winter-warmth",
		title: "Winter Warmth — 3 Nights",
		description:
			"Three nights, daily hot spring, breakfast and a guided ridge walk. For slow winter light.",
		image: img(curated.room1, 800, 600, "Winter light over mountains"),
		price: "From NPR 42,000",
		validity: "Dec — Feb",
		featured: true,
	},
];
