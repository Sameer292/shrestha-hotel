import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { getExperienceBySlug, getExperiences } from "@/lib/wordpress/queries";

export const revalidate = 60;
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
	const ex = await getExperienceBySlug(slug);
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
					<h1 className="display text-[36px] md:text-[44px] text-[var(--forest)] mt-8 leading-none">
						{ex.name}
					</h1>
					<p className="text-[15px] leading-relaxed text-[var(--muted)] mt-4 max-w-[60ch]">
						{ex.description}
					</p>
					<div className="flex flex-wrap gap-2 mt-6">
						{ex.duration && (
							<span className="text-xs border border-[var(--line)] bg-white px-3 py-1.5 rounded-full">
								{ex.duration}
							</span>
						)}
						{ex.difficulty && (
							<span className="text-xs border border-[var(--line)] bg-white px-3 py-1.5 rounded-full">
								{ex.difficulty}
							</span>
						)}
						{ex.season && (
							<span className="text-xs border border-[var(--line)] bg-white px-3 py-1.5 rounded-full">
								{ex.season}
							</span>
						)}
					</div>
				</div>
				<aside className="lg:col-span-5">
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6">
						<h3 className="font-display text-lg text-[var(--forest)]">
							Book this experience
						</h3>
						<p className="text-sm text-[var(--muted)] mt-2">
							Mention this experience when you book your stay — our team will
							arrange timing around weather and season.
						</p>
						<Link
							href="/booking"
							className="mt-4 block text-center bg-[var(--forest)] text-white py-3 rounded-full text-sm font-medium"
						>
							Enquire to Book
						</Link>
					</div>
				</aside>
			</div>
			<div className="container-outer py-12" />
		</div>
	);
}
