"use client";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/animations/gsap";

export default function Hero({
	data,
}: {
	data: {
		eyebrow: string;
		heading: string;
		subheading: string;
		image: { url: string; alt: string };
		primaryCta: string;
		secondaryCta: string;
	};
}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		registerGsap();
		const ctx = gsap.context(() => {
			gsap.fromTo(
				".hero-img",
				{ scale: 1.12 },
				{ scale: 1, duration: 2.2, ease: "power3.out" },
			);
			gsap.from(".hero-eyebrow", {
				autoAlpha: 0,
				y: 12,
				duration: 0.7,
				delay: 0.3,
			});
			gsap.from(".hero-heading span", {
				autoAlpha: 0,
				y: 40,
				duration: 0.9,
				stagger: 0.08,
				delay: 0.5,
				ease: "power3.out",
			});
			gsap.from(".hero-sub", {
				autoAlpha: 0,
				y: 12,
				duration: 0.7,
				delay: 0.9,
			});
			gsap.from(".hero-ctas", {
				autoAlpha: 0,
				y: 12,
				duration: 0.7,
				delay: 1.05,
			});
		}, ref);
		return () => ctx.revert();
	}, []);

	const lines = data.heading.split("\n");
	return (
		<section
			ref={ref}
			className="relative h-[92vh] min-h-[620px] overflow-hidden bg-[var(--forest)]"
		>
			<div className="absolute inset-0">
				<Image
					src={data.image.url}
					alt={data.image.alt}
					fill
					priority
					className="hero-img object-cover"
					unoptimized
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.35))]" />
			</div>

			<div className="relative z-10 h-full flex flex-col justify-end pb-12 md:pb-16">
				<div className="container-outer">
					<p className="hero-eyebrow eyebrow text-white/70 mb-4">
						{data.eyebrow}
					</p>
					<h1 className="hero-heading display text-white text-[42px] md:text-[64px] lg:text-[78px] max-w-[14ch]">
						{lines.map((l, i) => (
							<span key={i} className="block overflow-hidden">
								<span className="block">{l}</span>
							</span>
						))}
					</h1>
					<p className="hero-sub text-white/80 text-[15px] md:text-[17px] leading-relaxed max-w-[42ch] mt-5">
						{data.subheading}
					</p>
					<div className="hero-ctas flex flex-wrap gap-3 mt-8">
						<Link
							href="/booking"
							className="bg-white text-[var(--forest)] px-7 py-3 rounded-full text-sm font-medium inline-flex items-center gap-2 hover:bg-white/90 transition"
						>
							{data.primaryCta} <ArrowRight size={14} />
						</Link>
						<Link
							href="/stay"
							className="border border-white/30 text-white px-7 py-3 rounded-full text-sm font-medium backdrop-blur hover:bg-white/10 transition"
						>
							{data.secondaryCta}
						</Link>
					</div>
				</div>
			</div>

			<div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/60">
				<span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
				<span className="w-[1px] h-8 bg-white/40 animate-pulse" />
			</div>
		</section>
	);
}
