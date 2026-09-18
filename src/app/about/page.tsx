import Image from "next/image";
import ImageCarousel from "@/components/common/ImageCarousel";
import { getAboutPage, getFaqs, getHotelSettings } from "@/lib/wordpress/queries";

export const metadata = { title: "About — Our Story" };
export const revalidate = 10;

export default async function AboutPage() {
	const [page, faqs, settings] = await Promise.all([
		getAboutPage(),
		getFaqs(),
		getHotelSettings(),
	]);
	const a = {
		heading: page?.heading || "Hospitality,\nheld lightly",
		description: page?.description || "",
		body: page?.body || "",
		images:
			page?.carouselImages?.length ?? 0
				? (page?.carouselImages ?? [])
				: [{ url: "/placeholder.svg", alt: "About" }],
	};
	const faqCategory = page?.faqCategory || "About";
	const pageFaqs = faqs.filter((f) => f.category === faqCategory);
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-10">
				<p className="eyebrow text-[var(--moss)]">
					{page?.eyebrow || "About"}
				</p>
				<h1 className="display text-[40px] md:text-[56px] text-[var(--forest)] leading-none mt-2 max-w-[12ch] whitespace-pre-line">
					{a.heading}
				</h1>
				<div className="grid lg:grid-cols-12 gap-8 mt-8">
					<div className="lg:col-span-6">
						{!!a.description && (
							<p className="font-display text-[19px] md:text-[21px] leading-[1.5] text-[var(--forest)] max-w-[46ch] whitespace-pre-line">
								{a.description}
							</p>
						)}
						{a.body.split(/\n\n+/).map((p, i) => (
							<p
								key={i}
								className="text-[15px] leading-[1.8] text-[var(--muted)] mt-4 max-w-[52ch]"
							>
								{p}
							</p>
						))}
					</div>
					<div className="lg:col-span-6">
						<ImageCarousel images={a.images} label="About the hotel" />
					</div>
				</div>
			</div>
			{(page?.facilities?.length ?? 0) > 0 && (
				<div className="container-outer pb-12">
					<p className="eyebrow text-[var(--moss)] mb-3">Facilities</p>
					<h2 className="display text-[28px] md:text-[36px] text-[var(--forest)] leading-none">
						Everything the house offers
					</h2>
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
						{page?.facilities?.map((item) => (
							<div
								key={item.title}
								className="bg-white border border-[var(--line)] rounded-2xl p-5"
							>
								<h3 className="font-display text-lg text-[var(--forest)]">
									{item.title}
								</h3>
								<p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
									{item.text}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
			{(page?.services?.length ?? 0) > 0 && (
				<div className="container-outer pb-12">
					<div className="bg-[var(--forest)] text-white rounded-[20px] p-6 md:p-10">
						<p className="eyebrow mb-3 opacity-60">Services</p>
						<h2 className="display text-[28px] md:text-[36px] leading-none">
							Looked after, throughout
						</h2>
						<div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-6">
							{page?.services?.map((item) => (
								<div key={item.title}>
									<p className="text-sm font-medium">{item.title}</p>
									{item.text && (
										<p className="text-sm opacity-70 mt-1 leading-relaxed">
											{item.text}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}
			{(page?.locationHeading ||
				page?.locationText ||
				page?.locationMapImage) && (
				<div className="container-outer pb-12 grid lg:grid-cols-2 gap-8 items-start">
					<div>
						<p className="eyebrow text-[var(--moss)] mb-3">Location</p>
						{!!page?.locationHeading && (
							<h2 className="display text-[28px] md:text-[36px] text-[var(--forest)] leading-none whitespace-pre-line">
								{page.locationHeading}
							</h2>
						)}
						{!!page?.locationText && (
							<p className="text-[15px] leading-relaxed text-[var(--muted)] mt-4 max-w-[52ch] whitespace-pre-line">
								{page.locationText}
							</p>
						)}
						<p className="text-sm text-[var(--muted)] mt-4">
							{settings.address}
							<br />
							{settings.phone} • {settings.email}
						</p>
						<a
							href={settings.googleMapsUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-4 inline-block bg-[var(--forest)] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition"
						>
							Get Directions
						</a>
					</div>
					{page?.locationMapImage && (
						<div className="relative aspect-[4/3] rounded-[20px] overflow-hidden">
							<Image
								src={page.locationMapImage.url}
								alt={page.locationMapImage.alt}
								fill
								className="object-cover"
								unoptimized
								sizes="600px"
							/>
						</div>
					)}
				</div>
			)}
			{(page?.sustainabilityHeading ||
				page?.sustainabilityText ||
				(page?.sustainabilityItems?.length ?? 0) > 0) && (
				<div className="container-outer pb-12">
					<div className="bg-[var(--cream-2)] border border-[var(--line)] rounded-[20px] p-6 md:p-10">
						<p className="eyebrow text-[var(--moss)] mb-3">Sustainability</p>
						{!!page?.sustainabilityHeading && (
							<h2 className="display text-[28px] md:text-[36px] text-[var(--forest)] leading-none whitespace-pre-line">
								{page.sustainabilityHeading}
							</h2>
						)}
						{!!page?.sustainabilityText && (
							<p className="text-[15px] leading-relaxed text-[var(--muted)] mt-4 max-w-[62ch] whitespace-pre-line">
								{page.sustainabilityText}
							</p>
						)}
						{(page?.sustainabilityItems?.length ?? 0) > 0 && (
							<div className="grid sm:grid-cols-2 gap-4 mt-6">
								{page?.sustainabilityItems?.map((item) => (
									<div
										key={item.title}
										className="bg-white border border-[var(--line)] rounded-2xl p-5"
									>
										<h3 className="font-display text-lg text-[var(--forest)]">
											{item.title}
										</h3>
										<p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
											{item.text}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
			{pageFaqs.length > 0 && (
				<div className="container-outer pb-16 max-w-[760px]">
					<h2 className="display text-[28px] md:text-[36px] text-[var(--forest)]">
						Questions, answered
					</h2>
					<div className="mt-6 space-y-4">
						{pageFaqs.map((f) => (
							<div
								key={f.question}
								className="bg-white border border-[var(--line)] rounded-2xl p-5"
							>
								<p className="text-sm font-medium text-[var(--forest)]">
									{f.question}
								</p>
								<p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
									{f.answer}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
