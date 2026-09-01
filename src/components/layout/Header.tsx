"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
	{ href: "/", label: "Home" },
	{ href: "/stay", label: "Stay" },
	{ href: "/hot-spring", label: "Hot Spring" },
	{ href: "/experiences", label: "Experiences" },
	{ href: "/dining", label: "Dining" },
	{ href: "/gallery", label: "Gallery" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
];

export default function Header({
	bookingUrl = "/booking",
}: {
	bookingUrl?: string;
}) {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<>
			<header
				className={cn(
					"fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
					scrolled || open
						? "bg-[var(--cream)]/95 backdrop-blur-xl border-[var(--line)] py-3 shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
						: "bg-[var(--cream)]/90 backdrop-blur-xl border-[var(--line)]/60 py-5",
				)}
			>
				<div className="container-outer flex items-center justify-between">
					<Link href="/" className="flex items-center gap-3">
						<span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] tracking-[0.15em] font-medium border bg-[var(--forest)] text-[var(--cream)] border-[var(--forest)]">
							SH
						</span>
						<span className="leading-none text-[var(--forest)]">
							<span className="block font-display text-[17px] tracking-[-0.02em] font-medium">
								Shrestha Hotel
							</span>
							<span className="block text-[10px] tracking-[0.22em] uppercase opacity-70 -mt-[2px]">
								Hotspring • Myagdi
							</span>
						</span>
					</Link>

					<nav className="hidden lg:flex items-center gap-7">
						{NAV.slice(1).map((l) => (
							<Link
								key={l.href}
								href={l.href}
								className="text-[13px] tracking-wide transition-colors hover:opacity-100 opacity-80 text-[var(--ink)]"
							>
								{l.label}
							</Link>
						))}
					</nav>

					<div className="hidden lg:flex items-center gap-3">
						<Link
							href={bookingUrl}
							className="px-6 py-[10px] rounded-full text-[13px] tracking-wide font-medium transition-colors bg-[var(--forest)] text-white hover:bg-[var(--forest-2)]"
						>
							Book Your Stay
						</Link>
					</div>

					<button
						aria-label={open ? "Close menu" : "Open menu"}
						onClick={() => setOpen((v) => !v)}
						className="lg:hidden w-10 h-10 rounded-full grid place-items-center border transition-colors border-[var(--line)] text-[var(--forest)] bg-white"
					>
						{open ? <X size={18} /> : <Menu size={18} />}
					</button>
				</div>
			</header>

			{/* Fullscreen mobile menu */}
			<div
				className={cn(
					"fixed inset-0 z-40 bg-[var(--cream)] transition-transform duration-500 lg:hidden flex flex-col",
					open ? "translate-y-0" : "-translate-y-full",
				)}
			>
				<div className="pt-24 pb-8 container-outer flex flex-col gap-1 flex-1">
					{NAV.map((l) => (
						<Link
							key={l.href}
							href={l.href}
							onClick={() => setOpen(false)}
							className="font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[var(--forest)] py-3 border-b border-[var(--line)] flex justify-between items-center group"
						>
							<span>{l.label}</span>
							<span className="text-[11px] tracking-[0.2em] uppercase text-[var(--muted)] group-hover:text-[var(--forest)]">
								— Explore
							</span>
						</Link>
					))}
					<Link
						href={bookingUrl}
						onClick={() => setOpen(false)}
						className="mt-6 bg-[var(--forest)] text-white rounded-full py-4 text-center text-sm tracking-wide font-medium"
					>
						Book Your Stay
					</Link>
					<p className="text-xs text-[var(--muted)] mt-4 leading-relaxed">
						Beni, Myagdi • +977 9800000000
						<br />
						namaste@shresthahotel.com
					</p>
				</div>
			</div>
		</>
	);
}
