import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/lib/wordpress/types";

export default function Experiences({ items }: { items: Experience[] }) {
	return (
		<section className="py-16 md:py-20 bg-[var(--cream-2)] border-y border-[var(--line)]">
			<div className="container-outer">
				<p className="eyebrow text-[var(--moss)] mb-3">Experiences</p>
				<div className="flex flex-wrap justify-between gap-4 items-end mb-8">
					<h2 className="display text-[34px] md:text-[42px] text-[var(--forest)]">
						What the day asks for
					</h2>
					<Link
						href="/experiences"
						className="text-sm border-b border-[var(--forest)] pb-1"
					>
						View all experiences →
					</Link>
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{items.map((e) => (
						<Link
							key={e.slug}
							href={`/experiences/${e.slug}`}
							className="group bg-white rounded-[20px] overflow-hidden border border-[var(--line)]"
						>
							<div className="relative aspect-[4/3] overflow-hidden">
								<Image
									src={e.featuredImage.url}
									alt={e.featuredImage.alt}
									fill
									className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
									unoptimized
									sizes="400px"
								/>
							</div>
							<div className="p-5">
								<h3 className="font-display text-lg leading-tight text-[var(--forest)]">
									{e.name}
								</h3>
								<p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
									{e.excerpt}
								</p>
								<div className="flex gap-2 mt-3 text-[11px] tracking-wide">
									{e.duration && (
										<span className="bg-[var(--cream-2)] border border-[var(--line)] px-2.5 py-1 rounded-full">
											{e.duration}
										</span>
									)}
									{e.difficulty && (
										<span className="bg-[var(--cream-2)] border border-[var(--line)] px-2.5 py-1 rounded-full">
											{e.difficulty}
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
