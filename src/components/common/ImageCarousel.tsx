"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTOPLAY_MS = 5000;

export default function ImageCarousel({
	images,
	label,
}: {
	images: { url: string; alt: string }[];
	label: string;
}) {
	const [idx, setIdx] = useState(0);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);
	const n = images.length;

	const stop = useCallback(() => {
		if (timer.current) {
			clearInterval(timer.current);
			timer.current = null;
		}
	}, []);
	const start = useCallback(() => {
		stop();
		if (n < 2) return;
		timer.current = setInterval(
			() => setIdx((i) => (i + 1) % n),
			AUTOPLAY_MS,
		);
	}, [n, stop]);
	useEffect(() => {
		start();
		return stop;
	}, [start, stop]);

	const go = useCallback(
		(d: number) => {
			setIdx((i) => (i + d + n) % n);
			start();
		},
		[n, start],
	);

	if (n === 0) return null;
	return (
		<div
			className="relative aspect-[4/3] rounded-[20px] overflow-hidden group"
			onMouseEnter={stop}
			onMouseLeave={start}
		>
			{images.map((img, i) => (
				<Image
					key={`${img.url}-${i}`}
					src={img.url}
					alt={img.alt || label}
					fill
					className={`object-cover transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
					unoptimized
					sizes="600px"
					priority={i === 0}
				/>
			))}
			{n > 1 && (
				<>
					<button
						aria-label="Previous photo"
						onClick={() => go(-1)}
						className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full grid place-items-center bg-black/35 text-white backdrop-blur transition hover:bg-black/55 md:opacity-0 md:group-hover:opacity-100"
					>
						<ChevronLeft size={18} />
					</button>
					<button
						aria-label="Next photo"
						onClick={() => go(1)}
						className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full grid place-items-center bg-black/35 text-white backdrop-blur transition hover:bg-black/55 md:opacity-0 md:group-hover:opacity-100"
					>
						<ChevronRight size={18} />
					</button>
					<div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
						{images.map((_, i) => (
							<button
								key={i}
								aria-label={`Photo ${i + 1}`}
								onClick={() => {
									setIdx(i);
									start();
								}}
								className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white"}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
