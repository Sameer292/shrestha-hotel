import Image from "next/image";

export const metadata = { title: "About — Our Story" };

export default function AboutPage() {
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-10">
				<p className="eyebrow text-[var(--moss)]">About</p>
				<h1 className="display text-[40px] md:text-[56px] text-[var(--forest)] leading-none mt-2 max-w-[12ch]">
					Hospitality, held
					<br />
					lightly
				</h1>
				<div className="grid lg:grid-cols-12 gap-8 mt-8">
					<div className="lg:col-span-6">
						<p className="text-[15px] leading-[1.8] text-[var(--muted)]">
							Shrestha Hotel Hotspring began with a simple idea: a small place
							where people could be well — warm water, good food, and the quiet
							that the mountains do naturally. We are not a large resort. We are
							a family-run retreat in Myagdi, built from local stone and timber,
							served by people from nearby villages who know the trails, the
							seasons, and how to remember your name.
						</p>
						<p className="text-[15px] leading-[1.8] text-[var(--muted)] mt-4">
							We don’t claim certifications we haven’t earned or tell stories
							that aren’t ours. What we can promise is care: clean rooms, warm
							spring, honest food, and hospitality that feels like being
							welcomed into a home rather than processed through a hotel.
						</p>
						<div className="grid grid-cols-3 gap-4 mt-8">
							{[
								{ k: "Local", v: "Built and run with Myagdi families" },
								{ k: "Small", v: "12 rooms — calm over crowds" },
								{ k: "Warm", v: "Hot spring at the heart" },
							].map((c) => (
								<div
									key={c.k}
									className="bg-white border border-[var(--line)] rounded-2xl p-4"
								>
									<p className="font-display text-lg text-[var(--forest)]">
										{c.k}
									</p>
									<p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
										{c.v}
									</p>
								</div>
							))}
						</div>
					</div>
					<div className="lg:col-span-6">
						<div className="relative aspect-[4/3] rounded-[20px] overflow-hidden">
							<Image
								src="https://picsum.photos/seed/about1/1000/750"
								alt="Hotel exterior"
								fill
								className="object-cover"
								unoptimized
								sizes="600px"
							/>
						</div>
						<p className="text-xs text-[var(--muted)] mt-3">
							Placeholder image — replace with actual hotel photography via
							WordPress. References are centralized for easy swap.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
