"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Lightbox from "@/components/common/Lightbox";
import type { GalleryItem } from "@/lib/wordpress/types";

export default function GalleryPreview({ items }: { items: GalleryItem[] }) {
	const [idx, setIdx] = useState<number | null>(null);
	return (
		<section className="py-16 md:py-20 bg-[var(--forest)] text-[var(--cream)]">
			<div className="container-outer">
				<div className="flex justify-between items-end mb-8">
					<div>
						<p className="eyebrow text-white/60 mb-3">Gallery</p>
						<h2 className="display text-[34px] md:text-[42px]">
							A place in pictures
						</h2>
					</div>
					<Link
						href="/gallery"
						className="hidden md:inline-flex text-sm border-b border-white/30 pb-1 hover:border-white"
					>
						View full gallery →
					</Link>
				</div>
				<div className="grid grid-cols-12 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[220px]">
					{items.slice(0, 7).map((g, i) => (
						<button
							key={i}
							onClick={() => setIdx(i)}
							className={`relative overflow-hidden rounded-[16px] group text-left ${i === 0 ? "col-span-12 md:col-span-5 md:row-span-2" : i === 1 ? "col-span-6 md:col-span-4" : i === 2 ? "col-span-6 md:col-span-3" : "col-span-6 md:col-span-3"}`}
						>
							<Image
								src={g.image.url}
								alt={g.image.alt}
								fill
								className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
								unoptimized
								sizes="400px"
							/>
							<span className="absolute bottom-2 left-2 bg-black/40 backdrop-blur text-white text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full">
								{g.category}
							</span>
						</button>
					))}
				</div>
				<Link
					href="/gallery"
					className="md:hidden inline-flex mt-6 text-sm border-b border-white/30 pb-1"
				>
					View full gallery →
				</Link>
			</div>
			<Lightbox
				images={items.map((g) => g.image)}
				index={idx}
				onClose={() => setIdx(null)}
			/>
		</section>
	);
}
