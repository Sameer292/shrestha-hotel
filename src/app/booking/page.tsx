"use client";
import { useEffect, useState } from "react";

export default function BookingPage() {
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [rooms, setRooms] = useState<{ slug: string; name: string }[]>([]);
	useEffect(() => {
		fetch("/api/rooms")
			.then((r) => (r.ok ? r.json() : null))
			.then((d) => {
				if (Array.isArray(d)) setRooms(d);
			})
			.catch(() => {});
	}, []);
	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const data = Object.fromEntries(fd.entries());
		if (!data.name || !data.email) {
			setStatus("error");
			return;
		}
		setStatus("loading");
		try {
			const res = await fetch("/api/booking", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error();
			setStatus("success");
			(e.target as HTMLFormElement).reset();
		} catch {
			setStatus("error");
		}
	}
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-6">
				<p className="eyebrow text-[var(--moss)]">Booking</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2 whitespace-pre-line">
					Reserve your stay
				</h1>
				<p className="text-sm text-[var(--muted)] max-w-[56ch] mt-3 leading-relaxed">
					Tell us your dates — we confirm availability personally, usually
					within a few hours.
				</p>
			</div>
			<div className="container-outer pb-16 max-w-[760px]">
				<form
					onSubmit={onSubmit}
					className="bg-white border border-[var(--line)] rounded-[20px] p-6 md:p-8 space-y-4"
				>
					<div className="grid sm:grid-cols-2 gap-4">
						<label className="block">
							<span className="text-xs text-[var(--muted)]">Check-in *</span>
							<input
								name="checkin"
								type="date"
								required
								className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm"
							/>
						</label>
						<label className="block">
							<span className="text-xs text-[var(--muted)]">Check-out *</span>
							<input
								name="checkout"
								type="date"
								required
								className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm"
							/>
						</label>
					</div>
					<div className="grid sm:grid-cols-3 gap-4">
						<label className="block">
							<span className="text-xs text-[var(--muted)]">Adults</span>
							<input
								name="adults"
								type="number"
								min={1}
								defaultValue={2}
								className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm"
							/>
						</label>
						<label className="block">
							<span className="text-xs text-[var(--muted)]">Children</span>
							<input
								name="children"
								type="number"
								min={0}
								defaultValue={0}
								className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm"
							/>
						</label>
						<label className="block">
							<span className="text-xs text-[var(--muted)]">Room</span>
							<select
								name="room"
								className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm bg-white"
							>
								<option>Any room</option>
								{(rooms.length
									? rooms
									: [
											{ slug: "forest-retreat-suite", name: "Forest Retreat Suite" },
											{ slug: "hotspring-deluxe", name: "Hotspring Deluxe" },
											{
												slug: "mountain-family-retreat",
												name: "Mountain Family Retreat",
											},
											{ slug: "riverside-calm", name: "Riverside Calm" },
										]
								).map((r) => (
									<option key={r.slug}>{r.name}</option>
								))}
							</select>
						</label>
					</div>
					<div className="grid sm:grid-cols-2 gap-4">
						<label className="block">
							<span className="text-xs text-[var(--muted)]">Name *</span>
							<input
								name="name"
								required
								className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm"
							/>
						</label>
						<label className="block">
							<span className="text-xs text-[var(--muted)]">Email *</span>
							<input
								name="email"
								type="email"
								required
								className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm"
							/>
						</label>
					</div>
					<label className="block">
						<span className="text-xs text-[var(--muted)]">Phone</span>
						<input
							name="phone"
							type="tel"
							className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm"
						/>
					</label>
					<label className="block">
						<span className="text-xs text-[var(--muted)]">
							Special requests
						</span>
						<textarea
							name="requests"
							rows={4}
							className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-3 text-sm"
						/>
					</label>
					{status === "success" && (
						<p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
							Thank you — your inquiry has been received. We’ll confirm
							availability shortly.
						</p>
					)}
					{status === "error" && (
						<p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
							Something went wrong. Please check name and email, or contact
							us directly.
						</p>
					)}
					<input
						type="text"
						name="company"
						tabIndex={-1}
						autoComplete="off"
						aria-hidden="true"
						className="hidden"
					/>
					<button
						type="submit"
						disabled={status === "loading"}
						className="w-full bg-[var(--gold)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition disabled:opacity-60"
					>
						{status === "loading" ? "Sending…" : "Send Inquiry"}
					</button>
				</form>
			</div>
		</div>
	);
}
