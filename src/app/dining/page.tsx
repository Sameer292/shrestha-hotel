import Image from "next/image";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { getDiningPage } from "@/lib/wordpress/queries";

export const metadata = { title: "Dining — From the Mountains to the Table" };
export const revalidate = 10;

const DEFAULT_MEALS = [
	{
		t: "Breakfast",
		d: "Warm breads, mountain honey, seasonal fruit — served until 10:30 AM.",
	},
	{
		t: "Lunch & Dinner",
		d: "Dal, thali, wood-fired plates and valley herbs. Vegetarian options always available.",
	},
	{
		t: "Dietary",
		d: "Tell us your needs when booking — we cook with care for allergies and preferences.",
	},
];

export default async function DiningPage() {
	const page = await getDiningPage();
	const d = {
		heading: page?.heading || "",
		text: page?.subheading || "",
		images:
			page?.images?.length && page.images.length >= 2
				? page.images
				: [
						{ url: "/placeholder.svg", alt: "Dining" },
						{ url: "/placeholder.svg", alt: "Dining" },
					],
	};
	const meals = page?.cards?.length
		? page.cards.map((c) => ({ t: c.title, d: c.text }))
		: DEFAULT_MEALS;
	return (
		<div className="pt-20">
			<div className="container-outer pt-8">
				<Breadcrumbs
					items={[{ label: "Home", href: "/" }, { label: "Dining" }]}
				/>
				<p className="eyebrow text-[var(--moss)] mt-6">
					{page?.eyebrow || "Dining"}
				</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2 whitespace-pre-line">
					{d.heading}
				</h1>
				<p className="text-sm leading-relaxed text-[var(--muted)] max-w-[60ch] mt-4">
					{d.text}
				</p>
			</div>
			<div className="container-outer py-10 grid md:grid-cols-2 gap-4">
				{d.images.map((img, i) => (
					<div
						key={i}
						className="relative aspect-[4/3] rounded-[20px] overflow-hidden"
					>
						<Image
							src={img.url}
							alt={img.alt}
							fill
							className="object-cover"
							unoptimized
							sizes="600px"
						/>
					</div>
				))}
			</div>
			<div className="container-outer pb-16 grid md:grid-cols-3 gap-6">
				{meals.map((c) => (
					<div
						key={c.t}
						className="bg-white border border-[var(--line)] rounded-2xl p-6"
					>
						<h3 className="font-display text-lg text-[var(--forest)]">{c.t}</h3>
						<p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
							{c.d}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
