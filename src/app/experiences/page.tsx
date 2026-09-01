import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { getExperiences } from "@/lib/wordpress/queries";

export const revalidate = 60;
export const metadata = { title: "Experiences — Mountains, Villages & Rivers" };

export default async function ExperiencesPage() {
	const items = await getExperiences();
	return (
		<div className="pt-20">
			<div className="container-outer pt-8">
				<Breadcrumbs
					items={[{ label: "Home", href: "/" }, { label: "Experiences" }]}
				/>
				<p className="eyebrow text-[var(--moss)] mt-6">Experiences</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2">
					What the day asks for
				</h1>
				<p className="text-sm text-[var(--muted)] max-w-[56ch] mt-3 leading-relaxed">
					All experiences are managed in WordPress — add, remove or rewrite
					without touching code. Durations and seasons are optional; empty
					fields simply don’t render.
				</p>
			</div>
			<div className="container-outer py-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{items.map((e) => (
					<Link
						key={e.slug}
						href={`/experiences/${e.slug}`}
						className="group bg-white rounded-[20px] overflow-hidden border border-[var(--line)]"
					>
						<div className="relative aspect-[4/3] overflow-hidden">
							<Image
								src={e.featuredImage.url}
								alt={e.featuredImage.alt}
								fill
								className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
								unoptimized
								sizes="400px"
							/>
						</div>
						<div className="p-5">
							<h2 className="font-display text-lg text-[var(--forest)]">
								{e.name}
							</h2>
							<p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
								{e.excerpt}
							</p>
							<div className="flex gap-2 mt-3">
								{e.duration && (
									<span className="text-[11px] border border-[var(--line)] bg-[var(--cream-2)] px-2.5 py-1 rounded-full">
										{e.duration}
									</span>
								)}
								{e.difficulty && (
									<span className="text-[11px] border border-[var(--line)] bg-[var(--cream-2)] px-2.5 py-1 rounded-full">
										{e.difficulty}
									</span>
								)}
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
