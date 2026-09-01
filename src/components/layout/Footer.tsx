import Link from "next/link";
import { mockSettings } from "@/lib/wordpress/mock";

export default function Footer() {
	const s = mockSettings;
	const year = new Date().getFullYear();
	return (
		<footer className="bg-[var(--forest)] text-[var(--cream)]">
			<div className="container-outer py-14 md:py-16">
				<div className="grid md:grid-cols-12 gap-10">
					<div className="md:col-span-5">
						<div className="flex items-center gap-3">
							<span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 grid place-items-center text-[11px] tracking-[0.15em]">
								SH
							</span>
							<span className="leading-none">
								<span className="block font-display text-lg">
									Shrestha Hotel Hotspring
								</span>
								<span className="block text-[10px] tracking-[0.22em] uppercase opacity-60">
									Myagdi • Nepal
								</span>
							</span>
						</div>
						<p className="text-sm leading-relaxed opacity-70 mt-5 max-w-[36ch]">
							{s.footerDescription}
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
									href="/dining"
									className="hover:opacity-100 hover:underline underline-offset-4"
								>
									Dining
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
								className="bg-white text-[var(--forest)] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition"
							>
								Book Your Stay
							</Link>
							<a
								href={s.googleMapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="border border-white/20 px-6 py-2.5 rounded-full text-sm hover:bg-white/10 transition"
							>
								Directions
							</a>
						</div>
					</div>
				</div>

				<div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-3 justify-between text-xs opacity-50">
					<span>© {year} Shrestha Hotel Hotspring. All rights reserved.</span>
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
		</footer>
	);
}
