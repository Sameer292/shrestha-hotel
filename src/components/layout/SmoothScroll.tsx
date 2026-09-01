"use client";
import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/animations/gsap";

export default function SmoothScroll({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduce) return;
		registerGsap();
		const lenis = new Lenis({
			autoRaf: true,
			lerp: 0.08,
			smoothWheel: true,
			gestureOrientation: "vertical",
		});
		lenis.on("scroll", ScrollTrigger.update);
		const tick = (time: number) => lenis.raf(time * 1000);
		gsap.ticker.add(tick);
		gsap.ticker.lagSmoothing(0);
		return () => {
			gsap.ticker.remove(tick);
			lenis.destroy();
			for (const t of ScrollTrigger.getAll()) t.kill();
		};
	}, []);
	return <>{children}</>;
}
