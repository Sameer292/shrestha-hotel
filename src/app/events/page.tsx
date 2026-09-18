import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { getEventsPage } from "@/lib/wordpress/queries";

export const metadata = { title: "Events — Meetings, Weddings & Celebrations" };
export const revalidate = 10;

export default async function EventsPage() {
	const page = await getEventsPage();
	const images =
		page?.images?.length && page.images.length >= 2
			? page.images
			: [
					{ url: "/placeholder.svg", alt: "Events" },
					{ url: "/placeholder.svg", alt: "Events" },
				];
	return (
		<div className="pt-20">
			<div className="container-outer pt-8">
				<Breadcrumbs
					items={[{ label: "Home", href: "/" }, { label: "Events" }]}
				/>
				<p className="eyebrow text-[var(--moss)] mt-6">
					{page?.eyebrow || "Events"}
				</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2 whitespace-pre-line">
					{page?.heading || ""}
				</h1>
				{!!page?.subheading && (
					<p className="text-sm leading-relaxed text-[var(--muted)] max-w-[60ch] mt-4 whitespace-pre-line">
						{page.subheading}
					</p>
				)}
			</div>
			<div className="container-outer py-10 grid md:grid-cols-2 gap-4">
				{images.map((img, i) => (
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
			{(page?.cards?.length ?? 0) > 0 && (
				<div className="container-outer pb-10 grid md:grid-cols-3 gap-6">
					{page?.cards?.map((c) => (
						<div
							key={c.title}
							className="bg-white border border-[var(--line)] rounded-2xl p-6"
						>
							<h3 className="font-display text-lg text-[var(--forest)]">
								{c.title}
							</h3>
							<p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
								{c.text}
							</p>
						</div>
					))}
				</div>
			)}
			{(page?.features?.length ?? 0) > 0 && (
				<div className="container-outer pb-10">
					<div className="bg-[var(--cream-2)] border border-[var(--line)] rounded-[20px] p-6 md:p-8">
						<h2 className="font-display text-xl text-[var(--forest)]">
							{page?.featuresHeading || "Included with every event"}
						</h2>
						<ul className="mt-4 grid sm:grid-cols-2 gap-2.5">
							{page?.features?.map((feat, i) => (
								<li
									key={i}
									className="flex gap-3 text-sm leading-relaxed text-[var(--ink)]"
								>
									<span
										aria-hidden
										className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]"
									/>
									{feat}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
			<div className="container-outer pb-16 text-center">
				<Link
					href="/booking"
					className="inline-block bg-[var(--forest)] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition"
				>
					Enquire for Your Event
				</Link>
			</div>
		</div>
	);
}
