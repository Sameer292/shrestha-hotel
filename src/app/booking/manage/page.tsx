"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Booking = {
	ref: string;
	status: string;
	room: { name: string } | null;
	checkin: string;
	checkout: string;
	nights: number;
	total: number;
	currency: string;
	breakdown: { label: string; amount: number }[];
};

const inputCls =
	"mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm bg-white";

function ManageInner() {
	const params = useSearchParams();
	const [ref, setRef] = useState(params.get("ref") ?? "");
	const [email, setEmail] = useState("");
	const [booking, setBooking] = useState<Booking | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [cancelled, setCancelled] = useState(false);

	async function lookup(e?: React.FormEvent) {
		e?.preventDefault();
		setError("");
		setBooking(null);
		setCancelled(false);
		if (!ref.trim() || !email.trim()) {
			setError("Booking reference and email are required.");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(
				`/api/bookings?ref=${encodeURIComponent(ref.trim())}&email=${encodeURIComponent(email.trim())}`,
			);
			const d = await res.json();
			if (!res.ok) {
				setError(d.message ?? "Not found — check the reference and email.");
				return;
			}
			setBooking(d);
		} catch {
			setError("Network error — try again.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (params.get("ref")) void lookup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function cancel() {
		if (!confirm("Cancel this booking? The room will be released.")) return;
		setLoading(true);
		try {
			const res = await fetch("/api/bookings/cancel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ref: ref.trim(), email: email.trim() }),
			});
			if (!res.ok) throw new Error();
			setCancelled(true);
			setBooking((b) => (b ? { ...b, status: "cancelled" } : b));
		} catch {
			setError("Could not cancel — contact the hotel directly.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="container-outer pb-16 max-w-[640px]">
			<form
				onSubmit={lookup}
				className="bg-white border border-[var(--line)] rounded-[20px] p-6 md:p-8 space-y-4"
			>
				<div className="grid sm:grid-cols-2 gap-4">
					<label className="block">
						<span className="text-xs text-[var(--muted)]">Reference *</span>
						<input
							value={ref}
							onChange={(e) => setRef(e.target.value.toUpperCase())}
							placeholder="SH-XXXXXX"
							className={inputCls}
						/>
					</label>
					<label className="block">
						<span className="text-xs text-[var(--muted)]">Email *</span>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className={inputCls}
						/>
					</label>
				</div>
				{error && (
					<p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
						{error}
					</p>
				)}
				<button
					disabled={loading}
					className="w-full bg-[var(--forest)] text-white py-3 rounded-full text-sm font-medium disabled:opacity-60"
				>
					{loading ? "Looking up…" : "Find booking"}
				</button>
			</form>

			{booking && (
				<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 md:p-8 mt-4 text-sm space-y-1.5">
					<p className="font-medium text-[var(--forest)] text-base">
						{booking.ref} · {booking.status}
					</p>
					<p className="text-[var(--muted)]">
						{booking.room?.name} · {booking.checkin} → {booking.checkout} (
						{booking.nights} nights)
					</p>
					{booking.breakdown.map((l) => (
						<p key={l.label} className="flex justify-between gap-4">
							<span className="text-[var(--muted)]">{l.label}</span>
							<span>
								{booking.currency} {l.amount.toLocaleString()}
							</span>
						</p>
					))}
					<p className="flex justify-between gap-4 font-medium border-t border-[var(--line)] pt-2">
						<span>Total</span>
						<span>
							{booking.currency} {booking.total.toLocaleString()}
						</span>
					</p>
					{booking.status === "confirmed" && !cancelled && (
						<button
							onClick={cancel}
							disabled={loading}
							className="mt-3 w-full border border-red-300 text-red-700 py-2.5 rounded-full text-sm disabled:opacity-60"
						>
							Cancel booking
						</button>
					)}
					{cancelled && (
						<p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
							Cancelled — the room is released. Reply to your confirmation
							email if this was a mistake.
						</p>
					)}
				</div>
			)}
		</div>
	);
}

export default function ManagePage() {
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-6">
				<p className="eyebrow text-[var(--moss)]">Manage booking</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2">
					Find your stay
				</h1>
			</div>
			<Suspense>
				<ManageInner />
			</Suspense>
		</div>
	);
}
