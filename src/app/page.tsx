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
	getEventsPage,
	getExperiences,
	getFeaturedRooms,
	getGallery,
	getHomeEntry,
	getHotSpringPage,
	getHotelSettings,
	getTestimonials,
	getWellnessPage,
} from "@/lib/wordpress/queries";

export const revalidate = 10;

export default async function Home() {
	const [home, rooms, experiences, testimonials, gallery, settings, hs, events, wellness] =
		await Promise.all([
			getHomeEntry(),
			getFeaturedRooms(),
			getExperiences(),
			getTestimonials(),
			getGallery(),
			getHotelSettings(),
			getHotSpringPage(),
			getEventsPage(),
			getWellnessPage(),
		]);

	return (
		<>
			<Hero
				data={{
					eyebrow:
						home?.heroEyebrow || settings.hotelName.toUpperCase() || "SHRESTHA HOTEL HOTSPRING",
					heading: home?.tagline || settings.tagline,
					subheading: home?.subtagline || settings.subtagline,
					image: home?.heroImage ?? {
						url: "/placeholder.svg",
						alt: settings.hotelName,
					},
					primaryCta: home?.heroPrimaryCta || "Book Your Stay",
					primaryCtaUrl: home?.heroPrimaryCtaUrl || "/booking",
					secondaryCta: home?.heroSecondaryCta || "Explore the Hotel",
					secondaryCtaUrl: home?.heroSecondaryCtaUrl || "/stay",
				}}
			/>
			<Intro
				heading={home?.storyHeading || ""}
				body={home?.storyBody || ""}
				images={
					home?.storyImages?.length
						? home.storyImages
						: [
								{ url: "/placeholder.svg", alt: "Our story" },
								{ url: "/placeholder.svg", alt: "Our story" },
							]
				}
				eyebrow={home?.storyEyebrow}
				stats={home?.storyStats}
			/>
			<HotSpringFeature
				heading={hs?.teaserHeading || ""}
				text={hs?.teaserText || ""}
				image={hs?.heroImage ?? { url: "/placeholder.svg", alt: "Hot spring" }}
				temperature={hs?.temperature}
				hours={hs?.hours}
				cta={hs?.teaserCta}
				ctaUrl={hs?.teaserCtaUrl}
				bullets={hs?.bullets}
			/>
			<FeaturedRooms rooms={rooms} />
			<Experiences items={experiences.slice(0, 3)} />
			<DiningPreview
				eyebrow={events?.eyebrow || "Events"}
				heading={events?.teaserHeading || ""}
				text={events?.teaserText || ""}
				images={
					events?.images?.length
						? events.images
						: [
								{ url: "/placeholder.svg", alt: "Events" },
								{ url: "/placeholder.svg", alt: "Events" },
							]
				}
				cta={events?.teaserCta || "Explore Events"}
				ctaUrl={events?.teaserCtaUrl || "/events"}
			/>
			<DiningPreview
				eyebrow={wellness?.eyebrow || "Wellness"}
				heading={wellness?.teaserHeading || ""}
				text={wellness?.teaserText || ""}
				images={
					wellness?.images?.length
						? wellness.images
						: [
								{ url: "/placeholder.svg", alt: "Wellness" },
								{ url: "/placeholder.svg", alt: "Wellness" },
							]
				}
				cta={wellness?.teaserCta || "Explore Wellness"}
				ctaUrl={wellness?.teaserCtaUrl || "/wellness"}
			/>
			<GalleryPreview items={gallery} />
			<Testimonials items={testimonials} />
			<Location
				settings={settings}
				heading={home?.locationHeading}
				text={home?.locationText}
			/>
			<FinalCTA
				heading={home?.finalCtaHeading || ""}
				description={home?.finalCtaDescription || ""}
				image={
					home?.finalCtaImage ?? {
						url: "/placeholder.svg",
						alt: "Mountain escape",
					}
				}
				primaryCta={home?.finalCtaPrimaryCta}
				primaryCtaUrl={home?.finalCtaPrimaryCtaUrl}
				secondaryCta={home?.finalCtaSecondaryCta}
				secondaryCtaUrl={home?.finalCtaSecondaryCtaUrl}
			/>
		</>
	);
}
