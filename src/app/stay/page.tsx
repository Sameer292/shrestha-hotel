import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { formatPrice } from "@/lib/utils";
import { getRooms } from "@/lib/wordpress/queries";

export const metadata: Metadata = { title: "Stay — Rooms & Suites" };
export const revalidate = 10;

export default async function StayPage() {
	const rooms = await getRooms();
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-6">
				<Breadcrumbs
					items={[{ label: "Home", href: "/" }, { label: "Stay" }]}
				/>
				<p className="eyebrow text-[var(--moss)] mt-6">Stay</p>
				<h1 className="display text-[40px] md:text-[56px] text-[var(--forest)] leading-none mt-2">
					Rooms shaped by
					<br />
					mountain quiet
				</h1>
				<p className="text-[15px] leading-relaxed text-[var(--muted)] max-w-[52ch] mt-4">
					Timber, stone and linen — each room faces the valley or forest, with
					private baths and direct access to the hot spring. Edit all content
					from WordPress without redeploying.
				</p>
			</div>
			<div className="container-outer pb-16 grid md:grid-cols-2 gap-6">
				{rooms.map((r) => (
					<Link
						key={r.slug}
						href={`/stay/${r.slug}`}
						className="group bg-white rounded-[20px] overflow-hidden border border-[var(--line)]"
					>
						<div className="relative aspect-[4/3] overflow-hidden">
							<Image
								src={r.featuredImage.url}
								alt={r.featuredImage.alt}
								fill
								className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
								unoptimized
								sizes="600px"
							/>
							<span className="absolute top-4 left-4 bg-white text-[var(--forest)] text-xs px-3 py-1.5 rounded-full font-medium">
								{r.roomSize} • {r.view}
							</span>
						</div>
						<div className="p-6">
							<h2 className="font-display text-xl text-[var(--forest)]">
								{r.name}
							</h2>
							<p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
								{r.excerpt}
							</p>
							<div className="flex items-center gap-2 mt-4">
								<span className="text-xs tracking-wide bg-[var(--cream-2)] border border-[var(--line)] px-3 py-1 rounded-full">
									{r.bedType} • {r.capacity} guests
								</span>
								{r.startingPrice ? (
									<span className="text-sm font-medium text-[var(--forest)] ml-auto">
										{formatPrice(r.startingPrice, r.currency)}{" "}
										<span className="text-xs font-normal text-[var(--muted)]">
											/ night
										</span>
									</span>
								) : (
									<span className="text-xs text-[var(--muted)] ml-auto">
										Contact for rates
									</span>
								)}
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
