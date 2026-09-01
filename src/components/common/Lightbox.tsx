"use client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Lightbox({
	images,
	index,
	onClose,
}: {
	images: { url: string; alt: string }[];
	index: number | null;
	onClose: () => void;
}) {
	const [i, setI] = useState(0);
	useEffect(() => {
		if (index !== null) setI(index);
	}, [index]); // eslint-disable-line react-hooks/set-state-in-effect
	const next = useCallback(
		() => setI((v) => (v + 1) % images.length),
		[images.length],
	);
	const prev = useCallback(
		() => setI((v) => (v - 1 + images.length) % images.length),
		[images.length],
	);
	useEffect(() => {
		if (index === null) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") next();
			if (e.key === "ArrowLeft") prev();
		};
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [index, onClose, next, prev]);

	if (index === null) return null;
	const img = images[i];
	return (
		<div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur flex flex-col">
			<div className="flex justify-between items-center p-4 text-white/80">
				<span className="text-xs tracking-[0.2em] uppercase">
					{i + 1} / {images.length}
				</span>
				<button
					onClick={onClose}
					aria-label="Close"
					className="w-10 h-10 rounded-full bg-white/10 grid place-items-center hover:bg-white/20"
				>
					<X size={18} />
				</button>
			</div>
			<div className="flex-1 relative flex items-center justify-center p-4 md:p-8">
				<button
					onClick={prev}
					aria-label="Previous"
					className="absolute left-2 md:left-6 w-10 h-10 rounded-full bg-white/10 text-white grid place-items-center hover:bg-white/20"
				>
					<ChevronLeft />
				</button>
				<div className="relative w-full max-w-[1100px] h-[70vh]">
					<Image
						src={img.url}
						alt={img.alt}
						fill
						className="object-contain"
						unoptimized
						sizes="100vw"
					/>
				</div>
				<button
					onClick={next}
					aria-label="Next"
					className="absolute right-2 md:right-6 w-10 h-10 rounded-full bg-white/10 text-white grid place-items-center hover:bg-white/20"
				>
					<ChevronRight />
				</button>
			</div>
			<p className="text-center text-white/60 text-sm pb-6 px-4">{img.alt}</p>
		</div>
	);
}
