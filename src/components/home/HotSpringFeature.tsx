import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HotSpringFeature({
	heading,
	text,
	image,
	temperature,
	hours,
}: {
	heading: string;
	text: string;
	image: { url: string; alt: string };
	temperature?: string;
	hours?: string;
}) {
	return (
		<section className="py-6 md:py-10">
			<div className="container-outer">
				<div className="bg-[var(--forest)] rounded-[24px] overflow-hidden grid lg:grid-cols-12 text-[var(--cream)]">
					<div className="lg:col-span-6 relative min-h-[420px] lg:min-h-[560px]">
						<Image
							src={image.url}
							alt={image.alt}
							fill
							className="object-cover"
							unoptimized
							sizes="(max-width:1024px) 100vw, 50vw"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
						{/* floating card */}
						<div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto bg-[var(--cream)] text-[var(--forest)] rounded-2xl p-4 flex gap-4 items-center shadow-xl">
							<span className="w-10 h-10 rounded-full bg-[var(--forest)] text-white grid place-items-center text-sm">
								≈
							</span>
							<span className="text-sm leading-tight">
								<strong className="block text-[13px]">
									{temperature ?? "38–42°C"}
								</strong>
								<span className="text-xs text-[var(--muted)]">
									Mineral-rich • stone-lined
								</span>
							</span>
							<span className="ml-auto text-xs tracking-wide text-[var(--muted)] hidden sm:block">
								{hours ?? "6AM — 9PM"}
							</span>
						</div>
					</div>
					<div className="lg:col-span-6 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
						<p className="eyebrow text-white/60 mb-4">Hot Spring</p>
						<h2 className="display text-[36px] md:text-[46px] whitespace-pre-line leading-none">
							{heading}
						</h2>
						<p className="text-white/70 leading-relaxed mt-6 text-[15px] max-w-[42ch]">
							{text}
						</p>
						<ul className="mt-6 space-y-2 text-sm text-white/70">
							<li className="flex gap-2">
								<span className="text-white/40">—</span> Designed for relaxation
								and restoration
							</li>
							<li className="flex gap-2">
								<span className="text-white/40">—</span> Indoor & open-air pools
								• guest access included
							</li>
							<li className="flex gap-2">
								<span className="text-white/40">—</span> Quiet hours before 9AM
								— steam and silence
							</li>
						</ul>
						<Link
							href="/hot-spring"
							className="mt-8 inline-flex items-center gap-2 bg-white text-[var(--forest)] px-7 py-3 rounded-full text-sm font-medium w-fit hover:bg-white/90 transition"
						>
							Discover the Hot Spring <ArrowUpRight size={14} />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
