import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { formatPrice } from "@/lib/utils";
import { getRoomBySlug, getRooms } from "@/lib/wordpress/queries";

export const revalidate = 10;
export async function generateStaticParams() {
	const rooms = await getRooms();
	return rooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const room = await getRoomBySlug(slug);
	if (!room) return { title: "Room not found" };
	return {
		title: room.name,
		description: room.excerpt,
		openGraph: {
			title: room.name,
			description: room.excerpt,
			images: [room.featuredImage.url],
		},
	};
}

export default async function RoomPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const room = await getRoomBySlug(slug);
	if (!room) notFound();
	const rooms = await getRooms();
	const related = rooms.filter((r) => r.slug !== slug).slice(0, 2);
	return (
		<div className="pt-20">
			<div className="container-outer pt-6">
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/" },
						{ label: "Stay", href: "/stay" },
						{ label: room.name },
					]}
				/>
			</div>
			<div className="container-outer mt-6 grid lg:grid-cols-12 gap-8">
				<div className="lg:col-span-8">
					<div className="relative aspect-[16/10] rounded-[20px] overflow-hidden">
						<Image
							src={room.featuredImage.url}
							alt={room.featuredImage.alt}
							fill
							className="object-cover"
							unoptimized
							sizes="900px"
							priority
						/>
					</div>
					{room.gallery.length > 1 && (
						<div className="grid grid-cols-3 gap-3 mt-3">
							{room.gallery.slice(0, 3).map((g, i) => (
								<div
									key={i}
									className="relative aspect-[4/3] rounded-[14px] overflow-hidden"
								>
									<Image
										src={g.url}
										alt={g.alt}
										fill
										className="object-cover"
										unoptimized
										sizes="300px"
									/>
								</div>
							))}
						</div>
					)}
					<h1 className="display text-[36px] md:text-[46px] text-[var(--forest)] mt-8 leading-none">
						{room.name}
					</h1>
					<p className="text-sm tracking-wide text-[var(--muted)] mt-2">
						{room.view} • {room.roomSize} • {room.bedType}
					</p>
					<p className="text-[15px] leading-relaxed text-[var(--muted)] mt-6 max-w-[60ch]">
						{room.description}
					</p>
					<div className="mt-8">
						<h3 className="eyebrow text-[var(--moss)] mb-3">Amenities</h3>
						<div className="flex flex-wrap gap-2">
							{room.amenities.map((a) => (
								<span
									key={a}
									className="text-xs border border-[var(--line)] bg-white px-3 py-1.5 rounded-full"
								>
									{a}
								</span>
							))}
						</div>
					</div>
				</div>
				<aside className="lg:col-span-4">
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 sticky top-24">
						{room.startingPrice ? (
							<p className="font-display text-2xl text-[var(--forest)]">
								{formatPrice(room.startingPrice, room.currency)}{" "}
								<span className="text-xs font-normal text-[var(--muted)]">
									/ night
								</span>
							</p>
						) : (
							<p className="text-sm text-[var(--muted)]">
								Contact us for rates
							</p>
						)}
						<div className="text-xs text-[var(--muted)] mt-2 space-y-1">
							<p>
								{room.capacity} guests • {room.adults} adults
								{room.children ? ` • ${room.children} children` : ""}
							</p>
							<p>
								Check-in {room.checkIn} • Check-out {room.checkOut}
							</p>
						</div>
						<Link
							href="/booking"
							className="mt-5 block text-center bg-[var(--forest)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition"
						>
							Check Availability
						</Link>
						<a
							href="/contact"
							className="mt-2 block text-center border border-[var(--line)] py-3 rounded-full text-sm hover:bg-[var(--cream-2)] transition"
						>
							Ask a Question
						</a>
						<p className="text-xs text-[var(--muted)] mt-4 leading-relaxed">
							This is a reservation inquiry — no fake availability. Integrates
							with your PMS/booking engine via the Booking URL in WordPress
							settings.
						</p>
					</div>
					{related.length > 0 && (
						<div className="mt-6">
							<h4 className="eyebrow text-[var(--moss)] mb-3">
								You may also like
							</h4>
							<div className="space-y-3">
								{related.map((r) => (
									<Link
										key={r.slug}
										href={`/stay/${r.slug}`}
										className="flex gap-3 bg-white border border-[var(--line)] rounded-2xl p-3 hover:bg-[var(--cream-2)] transition"
									>
										<span className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
											<Image
												src={r.featuredImage.url}
												alt={r.featuredImage.alt}
												fill
												className="object-cover"
												unoptimized
												sizes="80px"
											/>
										</span>
										<span>
											<span className="block font-display text-sm leading-tight">
												{r.name}
											</span>
											<span className="block text-xs text-[var(--muted)]">
												{r.bedType}
											</span>
										</span>
									</Link>
								))}
							</div>
						</div>
					)}
				</aside>
			</div>
			<div className="container-outer py-12" />
		</div>
	);
}
