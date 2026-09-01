import Link from "next/link";

export default function Breadcrumbs({
	items,
}: {
	items: { label: string; href?: string }[];
}) {
	return (
		<nav
			aria-label="Breadcrumb"
			className="text-xs tracking-wide text-[var(--muted)]"
		>
			<ol className="flex items-center gap-2 flex-wrap">
				{items.map((it, i) => (
					<li key={i} className="flex items-center gap-2">
						{i > 0 && <span className="opacity-40">/</span>}
						{it.href ? (
							<Link
								href={it.href}
								className="hover:text-[var(--forest)] hover:underline underline-offset-4"
							>
								{it.label}
							</Link>
						) : (
							<span className="text-[var(--ink)]">{it.label}</span>
						)}
					</li>
				))}
			</ol>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: items.map((it, idx) => ({
							"@type": "ListItem",
							position: idx + 1,
							name: it.label,
							item: it.href
								? `https://www.shresthahotel.com${it.href}`
								: undefined,
						})),
					}),
				}}
			/>
		</nav>
	);
}
