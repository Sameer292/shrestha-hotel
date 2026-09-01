import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { HotelSettings } from "@/lib/wordpress/types";

export default function Location({ settings }: { settings: HotelSettings }) {
	return (
		<section className="py-16 md:py-20 bg-[var(--cream-2)] border-y border-[var(--line)]">
			<div className="container-outer grid lg:grid-cols-12 gap-8">
				<div className="lg:col-span-5">
					<p className="eyebrow text-[var(--moss)] mb-4">Location</p>
					<h2 className="display text-[34px] md:text-[40px] text-[var(--forest)] leading-none">
						In the quiet
						<br />
						of Myagdi
					</h2>
					<p className="text-sm leading-relaxed text-[var(--muted)] mt-5 max-w-[42ch]">
						Set in Beni, gateway to the Annapurna and Dhaulagiri trails — where
						the valley holds warmth and the ridges hold silence. Close enough to
						reach, far enough to feel away.
					</p>
					<ul className="mt-6 space-y-3 text-sm">
						<li className="flex gap-3 items-start">
							<MapPin size={16} className="mt-0.5 text-[var(--moss)]" />{" "}
							<span>{settings.address}</span>
						</li>
						<li className="flex gap-3 items-center">
							<Phone size={16} className="text-[var(--moss)]" />{" "}
							<a href={`tel:${settings.phone}`} className="hover:underline">
								{settings.phone}
							</a>
						</li>
						<li className="flex gap-3 items-center">
							<Mail size={16} className="text-[var(--moss)]" />{" "}
							<a href={`mailto:${settings.email}`} className="hover:underline">
								{settings.email}
							</a>
						</li>
					</ul>
					<div className="flex gap-3 mt-6">
						<a
							href={settings.googleMapsUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-[var(--forest)] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition"
						>
							Get Directions
						</a>
						<Link
							href="/contact"
							className="border border-[var(--forest)] text-[var(--forest)] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--forest)] hover:text-white transition"
						>
							Contact Us
						</Link>
					</div>
				</div>
				<div className="lg:col-span-7">
					<div className="rounded-[20px] overflow-hidden border border-[var(--line)] bg-white p-2">
						<div className="rounded-[14px] overflow-hidden aspect-[16/10] bg-[var(--stone)] relative">
							<iframe
								src={settings.googleMapsEmbed}
								className="absolute inset-0 w-full h-full border-0"
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								title="Map to Shrestha Hotel"
							/>
						</div>
					</div>
					<p className="text-xs text-[var(--muted)] mt-3">
						Map and distances are managed in WordPress — update the Google Maps
						URL and address in Hotel Settings without redeploying.
					</p>
				</div>
			</div>
		</section>
	);
}
