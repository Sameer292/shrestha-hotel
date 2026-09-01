import DiningPreview from "@/components/home/DiningPreview";
import Experiences from "@/components/home/Experiences";
import FeaturedRooms from "@/components/home/FeaturedRooms";
import FinalCTA from "@/components/home/FinalCTA";
import GalleryPreview from "@/components/home/GalleryPreview";
import Hero from "@/components/home/Hero";
import HotSpringFeature from "@/components/home/HotSpringFeature";
import Intro from "@/components/home/Intro";
import Location from "@/components/home/Location";
import Testimonials from "@/components/home/Testimonials";
import {
	getExperiences,
	getFeaturedRooms,
	getGallery,
	getHomeContent,
	getHotelSettings,
	getTestimonials,
} from "@/lib/wordpress/queries";

export const revalidate = 60;

export default async function Home() {
	const [home, rooms, experiences, testimonials, gallery, settings] =
		await Promise.all([
			getHomeContent(),
			getFeaturedRooms(),
			getExperiences(),
			getTestimonials(),
			getGallery(),
			getHotelSettings(),
		]);

	return (
		<>
			<Hero data={home.hero} />
			<Intro
				heading={home.intro.heading}
				body={home.intro.body}
				images={home.intro.images}
			/>
			<HotSpringFeature
				heading={home.hotSpring.heading}
				text={home.hotSpring.text}
				image={home.hotSpring.image}
				temperature={home.hotSpring.temperature}
				hours={home.hotSpring.hours}
			/>
			<FeaturedRooms rooms={rooms} />
			<Experiences items={experiences.slice(0, 3)} />
			<DiningPreview
				heading={home.dining.heading}
				text={home.dining.text}
				images={home.dining.images}
			/>
			<GalleryPreview items={gallery} />
			<Testimonials items={testimonials} />
			<Location settings={settings} />
			<FinalCTA
				heading={home.finalCta.heading}
				description={home.finalCta.description}
				image={home.finalCta.image}
			/>
		</>
	);
}
