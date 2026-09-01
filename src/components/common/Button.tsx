import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Button({
	href,
	children,
	variant = "dark",
	className,
}: {
	href: string;
	children: React.ReactNode;
	variant?: "dark" | "light" | "outline";
	className?: string;
}) {
	const base =
		"inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-all group";
	const styles = {
		dark: "bg-[var(--forest)] text-white hover:bg-[var(--forest-2)]",
		light: "bg-white text-[var(--forest)] hover:bg-white/90",
		outline:
			"border border-[var(--forest)] text-[var(--forest)] hover:bg-[var(--forest)] hover:text-white",
	}[variant];
	return (
		<Link href={href} className={cn(base, styles, className)}>
			<span>{children}</span>
			<ArrowUpRight
				size={14}
				className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			/>
		</Link>
	);
}
