import Image from "next/image";
import Link from "next/link";
import { getFaqs, getHotSpringPage } from "@/lib/wordpress/queries";

export const revalidate = 10;
export const metadata = { title: "Hot Spring — Natural Mineral Baths" };

const DEFAULT_CARDS = [
	{ title: "Temperature", text: "Mineral-rich • stone-lined" },
	{ title: "Hours", text: "Guest access included" },
	{ title: "Access", text: "Indoor & open-air • Quiet hours before 9AM" },
];

export default async function HotSpringPage() {
	const [faqs, page] = await Promise.all([getFaqs(), getHotSpringPage()]);
	const hs = {
		image: page?.heroImage ?? { url: "/placeholder.svg", alt: "Hot spring" },
		heading: page?.heading || "",
		temperature: page?.temperature || "",
		hours: page?.hours || "",
		text: page?.subheading || page?.body || "",
	};
	const cards = page?.cards?.length ? page.cards : DEFAULT_CARDS;
	const etiquette = page?.etiquette ?? [
		"Please shower before entering the baths.",
		"Keep voices low — the spring is a place for quiet.",
		"Children must be accompanied by an adult.",
		"Manage time in the water — step out to cool when needed.",
		"Follow posted signage for indoor vs. open-air pools.",
	];
	const faqCategory = page?.faqCategory || "Hot Spring";
	return (
		<div className="pt-20">
			<div className="relative h-[62vh] min-h-[420px] overflow-hidden bg-[var(--forest)]">
				<Image
					src={hs.image.url}
					alt={hs.image.alt}
					fill
					className="object-cover"
					unoptimized
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-black/35" />
				<div className="absolute inset-0 flex items-end">
					<div className="container-outer pb-10 text-white">
						<p className="eyebrow text-white/70">
							{page?.eyebrow || "Hot Spring"}
						</p>
						<h1 className="display text-[44px] md:text-[64px] leading-none mt-2 whitespace-pre-line">
							{hs.heading}
						</h1>
						<p className="text-white/80 max-w-[52ch] mt-4 leading-relaxed">
							{page?.subheading ||
								"Mineral-rich waters, held at a gentle warmth for slow, restorative bathing — surrounded by timber, steam and forest light."}
						</p>
					</div>
				</div>
			</div>

			<div className="container-outer py-12 grid lg:grid-cols-12 gap-10">
				<div className="lg:col-span-7">
					<h2 className="display text-[30px] text-[var(--forest)] whitespace-pre-line">
						{page?.heading || "A spring the mountain kept"}
					</h2>
					<p className="text-[15px] leading-relaxed text-[var(--muted)] mt-4 max-w-[60ch]">
						{hs.text} We keep the water at {hs.temperature} for comfortable,
						unhurried bathing. {page?.body}
					</p>
					<div className="grid sm:grid-cols-3 gap-4 mt-8">
						{cards.slice(0, 3).map((c) => (
							<div
								key={c.title}
								className="bg-white border border-[var(--line)] rounded-2xl p-5"
							>
								<p className="eyebrow text-[var(--moss)]">{c.title}</p>
								<p className="font-display text-lg mt-1">
									{c.title === "Temperature"
										? hs.temperature
										: c.title === "Hours"
											? hs.hours
											: "Indoor & open-air"}
								</p>
								<p className="text-xs text-[var(--muted)] mt-1">{c.text}</p>
							</div>
						))}
					</div>
					<h3 className="font-display text-xl text-[var(--forest)] mt-10">
						Etiquette & Guidelines
					</h3>
					<ul className="mt-4 space-y-2 text-sm text-[var(--muted)] list-disc pl-5">
						{etiquette.map((rule) => (
							<li key={rule}>{rule}</li>
						))}
					</ul>
				</div>
				<div className="lg:col-span-5">
					<div className="bg-[var(--gold)] text-[var(--cream)] rounded-[20px] p-7">
						<h3 className="font-display text-xl">
							{page?.sidebarTitle || "Plan your soak"}
						</h3>
						<p className="text-sm text-white/70 mt-2 leading-relaxed">
							{page?.sidebarText ||
								"The spring is best at dawn and after walks. Staying guests have complimentary access. Day access is not offered — the water is kept for guests of the house."}
						</p>
						<Link
							href={page?.ctaUrl || "/booking"}
							className="mt-6 inline-flex bg-[var(--forest)] text-white px-6 py-2.5 rounded-full text-sm font-medium"
						>
							{page?.ctaLabel || "Stay to Soak"}
						</Link>
					</div>
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 mt-6">
						<h4 className="eyebrow text-[var(--moss)] mb-4">FAQ</h4>
						<div className="space-y-4">
							{faqs
								.filter((f) => f.category === faqCategory)
								.map((f) => (
									<div key={f.question}>
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
				</div>
			</div>
		</div>
	);
}
