import Image from "next/image";
import Link from "next/link";
import { mockSettings } from "@/lib/wordpress/mock";
import type { HotelSettings } from "@/lib/wordpress/types";

export default function Footer({
	settings,
	footer,
}: {
	settings?: HotelSettings;
	footer?: {
		background?: { url: string; alt: string };
		tagline?: string;
		subtagline?: string;
		description?: string;
	};
}) {
	const s = settings ?? mockSettings;
	const year = new Date().getFullYear();
	const tagline = footer?.tagline || s.tagline;
	const subtagline = footer?.subtagline || s.subtagline;
	return (
		<footer className="relative bg-[var(--gold)] text-[var(--cream)] overflow-hidden">
			{footer?.background && (
				<>
					<Image
						src={footer.background.url}
						alt={footer.background.alt}
						fill
						className="object-cover"
						unoptimized
						sizes="100vw"
					/>
					<div className="absolute inset-0 bg-[var(--gold)]/85" />
				</>
			)}
			<div className="relative">
			<div className="container-outer py-14 md:py-16">
				<div className="grid md:grid-cols-12 gap-10">
					<div className="md:col-span-5">
						<div className="flex items-center gap-3">
							{s.logoUrl ? (
								<>
									<Image
										src={s.logoUrl}
										alt={s.hotelName}
										width={180}
										height={44}
										className="h-10 w-auto object-contain"
										unoptimized
									/>
									<span className="leading-none">
										<span className="block font-display text-lg">
											{s.hotelName}
										</span>
										<span className="block text-[10px] tracking-[0.22em] uppercase opacity-60">
											{tagline}
										</span>
									</span>
								</>
							) : (
								<>
									<span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 grid place-items-center text-[11px] tracking-[0.15em]">
										SH
									</span>
									<span className="leading-none">
										<span className="block font-display text-lg">
											{s.hotelName}
										</span>
										<span className="block text-[10px] tracking-[0.22em] uppercase opacity-60">
											{tagline}
										</span>
									</span>
								</>
							)}
						</div>
						{subtagline && (
							<p className="text-sm leading-relaxed opacity-70 mt-5 max-w-[36ch]">
								{subtagline}
							</p>
						)}
						<p className="text-sm leading-relaxed opacity-70 mt-5 max-w-[36ch]">
							{footer?.description || s.footerDescription}
						</p>
						<div className="flex gap-3 mt-6 text-sm">
							<a
								href={s.instagram}
								className="opacity-60 hover:opacity-100 transition"
							>
								Instagram
							</a>
							<a
								href={s.facebook}
								className="opacity-60 hover:opacity-100 transition"
							>
								Facebook
							</a>
							<a
								href={s.tripadvisor}
								className="opacity-60 hover:opacity-100 transition"
							>
								Tripadvisor
							</a>
						</div>
					</div>

					<div className="md:col-span-3">
						<h4 className="eyebrow opacity-60 mb-4">Explore</h4>
						<ul className="space-y-2 text-sm opacity-80">
							<li>
								<Link
									href="/stay"
									className="hover:opacity-100 hover:underline underline-offset-4"
								>
									Stay
								</Link>
							</li>
							<li>
								<Link
									href="/hot-spring"
									className="hover:opacity-100 hover:underline underline-offset-4"
								>
									Hot Spring
								</Link>
							</li>
							<li>
								<Link
									href="/experiences"
									className="hover:opacity-100 hover:underline underline-offset-4"
								>
									Experiences
								</Link>
							</li>
							<li>
								<Link
									href="/events"
									className="hover:opacity-100 hover:underline underline-offset-4"
								>
									Events
								</Link>
							</li>
							<li>
								<Link
									href="/wellness"
									className="hover:opacity-100 hover:underline underline-offset-4"
								>
									Wellness
								</Link>
							</li>
							<li>
								<Link
									href="/gallery"
									className="hover:opacity-100 hover:underline underline-offset-4"
								>
									Gallery
								</Link>
							</li>
							<li>
								<Link
									href="/about"
									className="hover:opacity-100 hover:underline underline-offset-4"
								>
									About
								</Link>
							</li>
						</ul>
					</div>

					<div className="md:col-span-4">
						<h4 className="eyebrow opacity-60 mb-4">Visit</h4>
						<p className="text-sm opacity-80 leading-relaxed">
							{s.address}
							<br />
							{s.phone}
							<br />
							{s.email}
						</p>
						<p className="text-xs opacity-60 mt-3">
							Check-in {s.checkIn} • Check-out {s.checkOut}
						</p>
						<div className="flex gap-3 mt-5">
							<Link
								href="/booking"
								className="bg-[var(--forest)] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition"
							>
								Book Your Stay
							</Link>
							<a
								href={s.googleMapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="border border-white/25 px-6 py-2.5 rounded-full text-sm hover:bg-white/10 transition"
							>
								Directions
							</a>
						</div>
					</div>
				</div>

				<div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-3 justify-between text-xs opacity-50">
					<span>
						© {year} {s.hotelName}. All rights reserved.
					</span>
					<span className="flex gap-4">
						<Link href="/privacy" className="hover:opacity-80">
							Privacy
						</Link>
						<Link href="/terms" className="hover:opacity-80">
							Terms
						</Link>
						<Link href="/contact" className="hover:opacity-80">
							Cancellation
						</Link>
					</span>
				</div>
			</div>
			</div>
		</footer>
	);
}
