import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
	getExperienceBySlug,
	getExperiences,
	getExperiencesPage,
} from "@/lib/wordpress/queries";

export const revalidate = 10;
export async function generateStaticParams() {
	const ex = await getExperiences();
	return ex.map((e) => ({ slug: e.slug }));
}
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const e = await getExperienceBySlug(slug);
	return e ? { title: e.name, description: e.excerpt } : { title: "Not found" };
}

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const [ex, page] = await Promise.all([
		getExperienceBySlug(slug),
		getExperiencesPage(),
	]);
	if (!ex) notFound();
	return (
		<div className="pt-20">
			<div className="container-outer pt-6">
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/" },
						{ label: "Experiences", href: "/experiences" },
						{ label: ex.name },
					]}
				/>
			</div>
			<div className="container-outer mt-6 grid lg:grid-cols-12 gap-8">
				<div className="lg:col-span-7">
					<div className="relative aspect-[16/10] rounded-[20px] overflow-hidden">
						<Image
							src={ex.featuredImage.url}
							alt={ex.featuredImage.alt}
							fill
							className="object-cover"
							unoptimized
							sizes="800px"
						/>
					</div>
					{ex.photos.length > 0 && (
						<div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x">
							{ex.photos.map((p, i) => (
								<div
									key={i}
									className="relative w-56 md:w-72 aspect-[4/3] shrink-0 snap-start overflow-hidden rounded-[16px]"
								>
									<Image
										src={p.url}
										alt={p.alt}
										fill
										className="object-cover"
										unoptimized
										sizes="300px"
									/>
								</div>
							))}
						</div>
					)}
					<h1 className="display text-[36px] md:text-[44px] text-[var(--forest)] mt-8 leading-none">
						{ex.name}
					</h1>
					{ex.location && (
						<p className="text-[13px] tracking-[0.14em] uppercase text-[var(--moss)] mt-3">
							{ex.location}
						</p>
					)}
					<div className="mt-4 max-w-[60ch] space-y-4">
						{ex.paragraphs.map((p, i) => (
							<p
								key={i}
								className="text-[15px] leading-relaxed text-[var(--muted)]"
							>
								{p}
							</p>
						))}
					</div>
					{ex.activities.length > 0 && (
						<div className="mt-8">
							<h2 className="font-display text-xl text-[var(--forest)]">
								What you&apos;ll do
							</h2>
							<ul className="mt-3 space-y-2.5">
								{ex.activities.map((a, i) => (
									<li
										key={i}
										className="flex gap-3 text-[15px] leading-relaxed text-[var(--ink)]"
									>
										<span
											aria-hidden
											className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]"
										/>
										{a}
									</li>
								))}
							</ul>
						</div>
					)}
					{ex.map && (
						<div className="mt-8">
							<h2 className="font-display text-xl text-[var(--forest)]">
								Getting there
							</h2>
							<div className="relative aspect-[16/9] rounded-[16px] overflow-hidden mt-3">
								<Image
									src={ex.map.image.url}
									alt={ex.map.image.alt}
									fill
									className="object-cover"
									unoptimized
									sizes="700px"
								/>
							</div>
							{ex.map.url && (
								<a
									href={ex.map.url}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-3 inline-block text-sm border-b border-[var(--forest)] pb-1"
								>
									View larger map →
								</a>
							)}
						</div>
					)}
				</div>
				<aside className="lg:col-span-5">
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6">
						<h3 className="font-display text-lg text-[var(--forest)]">
							{page?.sidebarTitle || "Book this experience"}
						</h3>
						<p className="text-sm text-[var(--muted)] mt-2">
							{page?.sidebarText ||
								"Mention this experience when you book your stay — our team will arrange the details with you."}
						</p>
						<Link
							href={page?.ctaUrl || "/booking"}
							className="mt-4 block text-center bg-[var(--gold)] text-white py-3 rounded-full text-sm font-medium"
						>
							{page?.ctaLabel || "Enquire to Book"}
						</Link>
					</div>
				</aside>
			</div>
			<div className="container-outer py-12" />
		</div>
	);
}
