import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DiningPreview({
	heading,
	text,
	images,
}: {
	heading: string;
	text: string;
	images: { url: string; alt: string }[];
}) {
	return (
		<section className="py-16 md:py-24 bg-[var(--cream)]">
			<div className="container-outer grid lg:grid-cols-12 gap-8 items-center">
				<div className="lg:col-span-5">
					<p className="eyebrow text-[var(--moss)] mb-4">Dining</p>
					<h2 className="display text-[34px] md:text-[44px] text-[var(--forest)] whitespace-pre-line leading-none">
						{heading}
					</h2>
					<p className="text-[15px] leading-relaxed text-[var(--muted)] mt-6 max-w-[42ch]">
						{text}
					</p>
					<Link
						href="/dining"
						className="mt-8 inline-flex items-center gap-2 bg-[var(--forest)] text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition"
					>
						Explore Dining <ArrowUpRight size={14} />
					</Link>
				</div>
				<div className="lg:col-span-7 grid grid-cols-12 gap-4">
					<div className="col-span-7 relative aspect-[4/5] rounded-[18px] overflow-hidden">
						<Image
							src={images[0].url}
							alt={images[0].alt}
							fill
							className="object-cover"
							unoptimized
							sizes="500px"
						/>
					</div>
					<div className="col-span-5 relative aspect-[4/5] rounded-[18px] overflow-hidden mt-8">
						<Image
							src={images[1].url}
							alt={images[1].alt}
							fill
							className="object-cover"
							unoptimized
							sizes="300px"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
