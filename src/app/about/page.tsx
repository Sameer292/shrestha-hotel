import Image from "next/image";
import { getAboutPage } from "@/lib/wordpress/queries";

export const metadata = { title: "About — Our Story" };
export const revalidate = 10;

const DEFAULT_STATS = [
	{ k: "Local", v: "Built and run with Myagdi families" },
	{ k: "Small", v: "12 rooms — calm over crowds" },
	{ k: "Warm", v: "Hot spring at the heart" },
];

export default async function AboutPage() {
	const page = await getAboutPage();
	const a = {
		heading: page?.heading || "Hospitality,\nheld lightly",
		body: page?.body || "",
		image: page?.image ?? { url: "/placeholder.svg", alt: "About" },
	};
	const stats = page?.stats?.length
		? page.stats.map((s) => ({ k: s.value, v: s.label }))
		: DEFAULT_STATS;
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
						{a.body.split(/\n\n+/).map((p, i) => (
							<p
								key={i}
								className="text-[15px] leading-[1.8] text-[var(--muted)] mt-4 first:mt-0"
							>
								{p}
							</p>
						))}
						<div className="grid grid-cols-3 gap-4 mt-8">
							{stats.map((c) => (
								<div
									key={c.k}
									className="bg-white border border-[var(--line)] rounded-2xl p-4"
								>
									<p className="font-display text-lg text-[var(--forest)]">
										{c.k}
									</p>
									<p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
										{c.v}
									</p>
								</div>
							))}
						</div>
					</div>
					<div className="lg:col-span-6">
						<div className="relative aspect-[4/3] rounded-[20px] overflow-hidden">
							<Image
								src={a.image.url}
								alt={a.image.alt}
								fill
								className="object-cover"
								unoptimized
								sizes="600px"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
