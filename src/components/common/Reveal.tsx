"use client";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/animations/gsap";

export function Reveal({
	children,
	delay = 0,
	y = 24,
	className,
}: {
	children: React.ReactNode;
	delay?: number;
	y?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		registerGsap();
		const el = ref.current;
		if (!el) return;
		const anim = gsap.fromTo(
			el,
			{ autoAlpha: 0, y },
			{
				autoAlpha: 1,
				y: 0,
				duration: 0.9,
				delay,
				ease: "power3.out",
				scrollTrigger: { trigger: el, start: "top 88%", once: true },
			},
		);
		return () => {
			anim.kill();
			ScrollTrigger.getAll().forEach((t) => t.kill());
		};
	}, [delay, y]);
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

export function ImageReveal({ children }: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		registerGsap();
		const el = ref.current;
		if (!el) return;
		gsap.fromTo(
			el,
			{ clipPath: "inset(0 100% 0 0)" },
			{
				clipPath: "inset(0 0% 0 0)",
				duration: 1.2,
				ease: "power4.inOut",
				scrollTrigger: { trigger: el, start: "top 85%", once: true },
			},
		);
	}, []);
	return (
		<div ref={ref} className="overflow-hidden">
			{children}
		</div>
	);
}
