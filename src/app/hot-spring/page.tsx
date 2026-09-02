import Image from "next/image";
import Link from "next/link";
import { mockHome } from "@/lib/wordpress/mock";
import { getFaqs } from "@/lib/wordpress/queries";

export const revalidate = 10;
export const metadata = { title: "Hot Spring — Natural Mineral Baths" };

export default async function HotSpringPage() {
	const faqs = await getFaqs();
	const hs = mockHome.hotSpring;
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
						<p className="eyebrow text-white/70">Hot Spring</p>
						<h1 className="display text-[44px] md:text-[64px] leading-none mt-2 whitespace-pre-line">
							{hs.heading}
						</h1>
						<p className="text-white/80 max-w-[52ch] mt-4 leading-relaxed">
							Mineral-rich waters, held at a gentle warmth for slow, restorative
							bathing — surrounded by timber, steam and forest light.
						</p>
					</div>
				</div>
			</div>

			<div className="container-outer py-12 grid lg:grid-cols-12 gap-10">
				<div className="lg:col-span-7">
					<h2 className="display text-[30px] text-[var(--forest)]">
						A spring the mountain kept
					</h2>
					<p className="text-[15px] leading-relaxed text-[var(--muted)] mt-4 max-w-[60ch]">
						{hs.text} We keep the water at {hs.temperature} for comfortable,
						unhurried bathing. Please note: we describe the spring as designed
						for relaxation and restoration — not as a medical treatment.
					</p>
					<div className="grid sm:grid-cols-3 gap-4 mt-8">
						<div className="bg-white border border-[var(--line)] rounded-2xl p-5">
							<p className="eyebrow text-[var(--moss)]">Temperature</p>
							<p className="font-display text-lg mt-1">{hs.temperature}</p>
							<p className="text-xs text-[var(--muted)] mt-1">
								Mineral-rich • stone-lined
							</p>
						</div>
						<div className="bg-white border border-[var(--line)] rounded-2xl p-5">
							<p className="eyebrow text-[var(--moss)]">Hours</p>
							<p className="font-display text-lg mt-1">{hs.hours}</p>
							<p className="text-xs text-[var(--muted)] mt-1">
								Guest access included
							</p>
						</div>
						<div className="bg-white border border-[var(--line)] rounded-2xl p-5">
							<p className="eyebrow text-[var(--moss)]">Access</p>
							<p className="font-display text-lg mt-1">Indoor & open-air</p>
							<p className="text-xs text-[var(--muted)] mt-1">
								Quiet hours before 9AM
							</p>
						</div>
					</div>
					<h3 className="font-display text-xl text-[var(--forest)] mt-10">
						Etiquette & Guidelines
					</h3>
					<ul className="mt-4 space-y-2 text-sm text-[var(--muted)] list-disc pl-5">
						<li>Please shower before entering the baths.</li>
						<li>Keep voices low — the spring is a place for quiet.</li>
						<li>Children must be accompanied by an adult.</li>
						<li>Manage time in the water — step out to cool when needed.</li>
						<li>Follow posted signage for indoor vs. open-air pools.</li>
					</ul>
				</div>
				<div className="lg:col-span-5">
					<div className="bg-[var(--forest)] text-[var(--cream)] rounded-[20px] p-7">
						<h3 className="font-display text-xl">Plan your soak</h3>
						<p className="text-sm text-white/70 mt-2 leading-relaxed">
							The spring is best at dawn and after walks. Staying guests have
							complimentary access. Day access is not offered — the water is
							kept for guests of the house.
						</p>
						<Link
							href="/booking"
							className="mt-6 inline-flex bg-white text-[var(--forest)] px-6 py-2.5 rounded-full text-sm font-medium"
						>
							Stay to Soak
						</Link>
					</div>
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 mt-6">
						<h4 className="eyebrow text-[var(--moss)] mb-4">FAQ</h4>
						<div className="space-y-4">
							{faqs
								.filter((f) => f.category === "Hot Spring")
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
