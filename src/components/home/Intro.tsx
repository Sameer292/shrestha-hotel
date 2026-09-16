import Image from "next/image";

const DEFAULT_STATS = [
	{ value: "12", label: "Rooms & Suites" },
	{ value: "38–42°", label: "Hot Spring" },
	{ value: "Since", label: "Myagdi" },
];

export default function Intro({
	heading,
	body,
	images,
	stats,
	eyebrow,
}: {
	heading: string;
	body: string;
	images: { url: string; alt: string }[];
	stats?: { value: string; label: string }[];
	eyebrow?: string;
}) {
	const shown = stats?.length ? stats : DEFAULT_STATS;
	return (
		<section className="py-16 md:py-24 bg-[var(--cream)]">
			<div className="container-outer">
				<div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-start">
					<div className="lg:col-span-5 lg:sticky lg:top-28">
						<p className="eyebrow text-[var(--moss)] mb-6">
							{eyebrow || "Our Story"}
						</p>
						<h2 className="display text-[34px] md:text-[44px] text-[var(--forest)] whitespace-pre-line leading-[0.95]">
							{heading}
						</h2>
						<p className="text-[15px] leading-[1.8] text-[var(--muted)] mt-6 max-w-[42ch]">
							{body}
						</p>
						<div className="mt-8 flex gap-6 text-xs tracking-wide text-[var(--muted)] border-t border-[var(--line)] pt-6">
							{shown.map((s) => (
								<span key={`${s.value}-${s.label}`}>
									<strong className="text-[var(--forest)] block text-lg font-display">
										{s.value}
									</strong>{" "}
									{s.label}
								</span>
							))}
						</div>
					</div>
					<div className="lg:col-span-7 grid grid-cols-12 gap-4">
						<div className="col-span-7">
							<div className="relative aspect-[4/5] overflow-hidden rounded-[18px]">
								<Image
									src={images[0].url}
									alt={images[0].alt}
									fill
									className="object-cover"
									unoptimized
									sizes="(max-width:768px) 60vw, 400px"
								/>
							</div>
							<p className="text-xs text-[var(--muted)] mt-3">
								Morning light over the ridge — view from the lodge
							</p>
						</div>
						<div className="col-span-5 pt-12">
							<div className="relative aspect-[4/5] overflow-hidden rounded-[18px]">
								<Image
									src={images[1].url}
									alt={images[1].alt}
									fill
									className="object-cover"
									unoptimized
									sizes="300px"
								/>
							</div>
							<p className="text-xs text-[var(--muted)] mt-3">
								Materials of the place: stone, timber, linen
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
