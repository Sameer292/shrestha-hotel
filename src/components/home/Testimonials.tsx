import type { Testimonial } from "@/lib/wordpress/types";

export default function Testimonials({ items }: { items: Testimonial[] }) {
	if (!items.length) return null;
	return (
		<section className="py-16 md:py-20 bg-[var(--cream)]">
			<div className="container-outer">
				<p className="eyebrow text-[var(--moss)] mb-8 text-center">Guests</p>
				<div className="grid md:grid-cols-3 gap-6">
					{items.map((t, i) => (
						<div
							key={i}
							className="bg-white border border-[var(--line)] rounded-[20px] p-7 md:p-8"
						>
							<div className="text-[var(--accent)] text-sm tracking-[0.2em] mb-4">
								★★★★★
							</div>
							<p className="font-display text-[18px] leading-[1.4] text-[var(--forest)]">
								“{t.quote}”
							</p>
							<p className="text-xs tracking-wide text-[var(--muted)] mt-6">
								— {t.guestName} • {t.guestLocation}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
