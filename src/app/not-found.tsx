import Link from "next/link";

export default function NotFound() {
	return (
		<div className="pt-20 min-h-[70vh] flex items-center">
			<div className="container-outer py-16 text-center">
				<p className="eyebrow text-[var(--moss)]">404</p>
				<h1 className="display text-[40px] md:text-[56px] text-[var(--forest)] leading-none mt-3">
					Looks like this
					<br />
					trail ends here
				</h1>
				<p className="text-sm text-[var(--muted)] mt-4 max-w-[42ch] mx-auto leading-relaxed">
					The page you’re looking for has moved or the mountain path took a
					different turn. Let’s get you back to warmth.
				</p>
				<div className="flex gap-3 justify-center mt-8">
					<Link
						href="/"
						className="bg-[var(--forest)] text-white px-7 py-3 rounded-full text-sm font-medium"
					>
						Return Home
					</Link>
					<Link
						href="/stay"
						className="border border-[var(--forest)] text-[var(--forest)] px-7 py-3 rounded-full text-sm font-medium"
					>
						Explore Rooms
					</Link>
				</div>
			</div>
		</div>
	);
}
