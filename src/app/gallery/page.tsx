"use client";
import Image from "next/image";
import { useState } from "react";
import Lightbox from "@/components/common/Lightbox";
import { mockGallery } from "@/lib/wordpress/mock";

const cats = [
	"All",
	"Hotel",
	"Rooms",
	"Hot Spring",
	"Nature",
	"Dining",
	"Experiences",
];

export default function GalleryPage() {
	const [cat, setCat] = useState("All");
	const [idx, setIdx] = useState<number | null>(null);
	const filtered =
		cat === "All" ? mockGallery : mockGallery.filter((g) => g.category === cat);
	const images = filtered.map((g) => g.image);
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-6">
				<p className="eyebrow text-[var(--moss)]">Gallery</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2">
					A place in pictures
				</h1>
				<div className="flex flex-wrap gap-2 mt-6">
					{cats.map((c) => (
						<button
							key={c}
							onClick={() => setCat(c)}
							className={`px-4 py-1.5 rounded-full text-sm border transition ${cat === c ? "bg-[var(--forest)] text-white border-[var(--forest)]" : "bg-white border-[var(--line)] hover:bg-[var(--cream-2)]"}`}
						>
							{c}
						</button>
					))}
				</div>
			</div>
			<div className="container-outer pb-16">
				<div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[240px]">
					{filtered.map((g, i) => (
						<button
							key={i}
							onClick={() => setIdx(i)}
							className="relative overflow-hidden rounded-[16px] group text-left"
						>
							<Image
								src={g.image.url}
								alt={g.image.alt}
								fill
								className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
								unoptimized
								sizes="400px"
							/>
							<span className="absolute bottom-2 left-2 bg-black/40 backdrop-blur text-white text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full">
								{g.category}
							</span>
						</button>
					))}
				</div>
				{filtered.length === 0 && (
					<p className="text-sm text-[var(--muted)] mt-8">
						No images in this category yet — add them in WordPress → Gallery
						Items.
					</p>
				)}
			</div>
			<Lightbox images={images} index={idx} onClose={() => setIdx(null)} />
		</div>
	);
}
