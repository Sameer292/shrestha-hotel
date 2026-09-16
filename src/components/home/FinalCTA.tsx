import Image from "next/image";
import Link from "next/link";

export default function FinalCTA({
	heading,
	description,
	image,
	primaryCta,
	primaryCtaUrl,
	secondaryCta,
	secondaryCtaUrl,
}: {
	heading: string;
	description: string;
	image: { url: string; alt: string };
	primaryCta?: string;
	primaryCtaUrl?: string;
	secondaryCta?: string;
	secondaryCtaUrl?: string;
}) {
	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0">
				<Image
					src={image.url}
					alt={image.alt}
					fill
					className="object-cover"
					unoptimized
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-[var(--gold)]/70" />
			</div>
			<div className="relative z-10 container-outer py-20 md:py-28 text-center text-white">
				<h2 className="display text-[36px] md:text-[52px] max-w-[12ch] mx-auto leading-none">
					{heading}
				</h2>
				<p className="text-white/80 mt-4 max-w-[42ch] mx-auto leading-relaxed">
					{description}
				</p>
				<div className="flex gap-3 justify-center mt-8">
					<Link
						href={primaryCtaUrl || "/booking"}
						className="bg-[var(--forest)] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition"
					>
						{primaryCta || "Book Your Stay"}
					</Link>
					<Link
						href={secondaryCtaUrl || "/contact"}
						className="border border-white/30 text-white px-8 py-3 rounded-full text-sm font-medium backdrop-blur hover:bg-white/10 transition"
					>
						{secondaryCta || "Contact Us"}
					</Link>
				</div>
			</div>
		</section>
	);
}
