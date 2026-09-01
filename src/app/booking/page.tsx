"use client";
import { useState } from "react";

export default function BookingPage() {
	const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const data = Object.fromEntries(fd.entries());
		if (!data.name || !data.email) {
			alert("Name and email required");
			return;
		}
		setStatus("loading");
		await new Promise((r) => setTimeout(r, 900));
		setStatus("success");
		(e.target as HTMLFormElement).reset();
	}
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-6">
				<p className="eyebrow text-[var(--moss)]">Booking</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2">
					Reserve your stay
				</h1>
				<p className="text-sm text-[var(--muted)] max-w-[56ch] mt-3 leading-relaxed">
					This is a reservation inquiry — not a fake availability system. When
					your PMS/booking engine is ready, set{" "}
					<code className="bg-[var(--cream-2)] px-1.5 py-0.5 rounded text-xs">
						Booking URL
					</code>{" "}
					in WordPress settings and the header CTA will open your engine. Until
					then, inquiries come here.
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
								<option>Forest Retreat Suite</option>
								<option>Hotspring Deluxe</option>
								<option>Mountain Family Retreat</option>
								<option>Riverside Calm</option>
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
					<button
						type="submit"
						disabled={status === "loading"}
						className="w-full bg-[var(--forest)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition disabled:opacity-60"
					>
						{status === "loading" ? "Sending…" : "Send Inquiry"}
					</button>
				</form>
			</div>
		</div>
	);
}
