import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Room } from "@/lib/wordpress/types";

export default function FeaturedRooms({ rooms }: { rooms: Room[] }) {
	return (
		<section className="py-16 md:py-24 bg-[var(--cream)]">
			<div className="container-outer">
				<div className="flex flex-wrap justify-between items-end gap-4 mb-10">
					<div>
						<p className="eyebrow text-[var(--moss)] mb-3">Stay</p>
						<h2 className="display text-[34px] md:text-[44px] text-[var(--forest)]">
							A room for how you
							<br />
							want to be here
						</h2>
					</div>
					<Link
						href="/stay"
						className="text-sm tracking-wide border-b border-[var(--forest)] pb-1 hover:opacity-70"
					>
						View all rooms →
					</Link>
				</div>

				<div className="grid md:grid-cols-12 gap-6 auto-rows-[420px]">
					{rooms.slice(0, 3).map((r, idx) => (
						<Link
							key={r.slug}
							href={`/stay/${r.slug}`}
							className={`group relative overflow-hidden rounded-[20px] bg-white ${idx === 0 ? "md:col-span-7" : idx === 1 ? "md:col-span-5" : "md:col-span-12 md:h-[480px]"} border border-[var(--line)]`}
						>
							<Image
								src={r.featuredImage.url}
								alt={r.featuredImage.alt}
								fill
								className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]"
								unoptimized
								sizes="(max-width:768px) 100vw, 50vw"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
							<div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
								<p className="text-[11px] tracking-[0.18em] uppercase opacity-70 mb-2">
									{r.view} • {r.roomSize}
								</p>
								<h3 className="font-display text-[22px] md:text-[26px] leading-none">
									{r.name}
								</h3>
								<p className="text-sm opacity-80 mt-2 max-w-[36ch] line-clamp-2">
									{r.excerpt}
								</p>
								<div className="flex items-center gap-3 mt-4 text-xs">
									<span className="bg-white text-[var(--forest)] px-3 py-1.5 rounded-full font-medium">
										{r.bedType} • {r.capacity} guests
									</span>
									{r.startingPrice ? (
										<span className="bg-white/15 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full">
											{formatPrice(r.startingPrice, r.currency)} / night
										</span>
									) : (
										<span className="bg-white/15 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full">
											Contact for rates
										</span>
									)}
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
