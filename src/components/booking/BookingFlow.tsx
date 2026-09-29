"use client";
import Link from "next/link";
import { useEffect, useState } from "react";


type RoomOpt = {
	slug: string;
	name: string;
	id: number;
	startingPrice: number | null;
	currency: string;
};
type MealPlan = { name: string; price: number };
type Quote = {
	currency: string;
	nights: number;
	lines: { label: string; amount: number }[];
	total: number;
	available: boolean;
};
type BookingOpts = {
	currency: string;
	mealPlans: MealPlan[];
	policies: string[];
	checkIn: string;
	checkOut: string;
};

const inputCls =
	"mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm bg-white";
const labelCls = "block";
const spanCls = "text-xs text-[var(--muted)]";

function nightsBetween(a: string, c: string): number {
	if (!a || !c) return 0;
	const ms = new Date(`${c}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime();
	return Math.max(0, Math.round(ms / 86400000));
}

export default function BookingFlow() {
	const [step, setStep] = useState(1);
	const [rooms, setRooms] = useState<RoomOpt[]>([]);
	const [opts, setOpts] = useState<BookingOpts | null>(null);
	const [roomId, setRoomId] = useState(0);
	const [checkin, setCheckin] = useState("");
	const [checkout, setCheckout] = useState("");
	const [adults, setAdults] = useState(2);
	const [children, setChildren] = useState(0);
	const [infants, setInfants] = useState(0);
	const [country, setCountry] = useState("");
	const [purpose, setPurpose] = useState("");
	const [mealPlan, setMealPlan] = useState("");
	const [extraBeds, setExtraBeds] = useState(0);
	const [pickup, setPickup] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [requests, setRequests] = useState("");
	const [agree, setAgree] = useState(false);
	const [quote, setQuote] = useState<Quote | null>(null);
	const [result, setResult] = useState<{ ref: string; total: number; currency: string } | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const today = new Date().toISOString().slice(0, 10);
	const nights = nightsBetween(checkin, checkout);

	useEffect(() => {
		fetch("/api/rooms")
			.then((r) => (r.ok ? r.json() : []))
			.then((d) => Array.isArray(d) && setRooms(d.filter((r: RoomOpt) => r.id)))
			.catch(() => {});
		fetch("/api/booking-options")
			.then((r) => (r.ok ? r.json() : null))
			.then((d) => d && setOpts(d))
			.catch(() => {});
	}, []);

	async function checkAvailability() {
		setError("");
		if (!roomId || !checkin || !checkout || nights < 1) {
			setError("Pick a room and valid dates.");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("/api/quote", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ room_id: roomId, checkin, checkout, adults }),
			});
			const d = await res.json();
			if (!res.ok || !d.available) {
				setError(
					res.status === 409 || d.available === false
						? "Sold out for those dates — try other dates or rooms."
						: (d.message ?? "Could not check availability."),
				);
				return;
			}
			setQuote(d);
			setStep(2);
		} catch {
			setError("Network error — try again.");
		} finally {
			setLoading(false);
		}
	}

	async function calculate() {
		setError("");
		setLoading(true);
		try {
			const res = await fetch("/api/quote", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					room_id: roomId,
					checkin,
					checkout,
					adults,
					children,
					infants,
					extra_beds: extraBeds,
					meal_plan: mealPlan,
					pickup,
				}),
			});
			const d = await res.json();
			if (!res.ok || !d.available) {
				setError("Just sold out — try other dates.");
				setStep(1);
				return;
			}
			setQuote(d);
		} catch {
			setError("Network error — try again.");
		} finally {
			setLoading(false);
		}
	}

	async function confirm() {
		setError("");
		if (name.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			setError("Name and a valid email are required.");
			return;
		}
		if (!agree) {
			setError("Please accept the booking policies to continue.");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("/api/bookings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					room_id: roomId,
					checkin,
					checkout,
					adults,
					children,
					infants,
					country,
					purpose,
					meal_plan: mealPlan,
					extra_beds: extraBeds,
					pickup,
					name: name.trim(),
					email: email.trim(),
					phone,
					requests,
					company: "",
				}),
			});
			const d = await res.json();
			if (!res.ok) {
				setError(
					res.status === 409
						? "Just sold out while confirming — try other dates."
						: (d.message ?? "Booking failed — try again."),
				);
				if (res.status === 409) setStep(1);
				return;
			}
			setResult({ ref: d.ref, total: d.total, currency: d.currency });
			setStep(4);
		} catch {
			setError("Network error — try again.");
		} finally {
			setLoading(false);
		}
	}

	const roomName = rooms.find((r) => r.id === roomId)?.name ?? "";

	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-6">
				<p className="eyebrow text-[var(--moss)]">Booking</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2">
					Reserve your stay
				</h1>
				<p className="text-sm text-[var(--muted)] max-w-[56ch] mt-3 leading-relaxed">
					Instant confirmation, pay at the hotel. No prepayment.
				</p>
				<p className="text-xs text-[var(--muted)] mt-2">
					Step {Math.min(step, 3)} of 3
					{" · "}
					<Link href="/booking/manage" className="underline underline-offset-4">
						Manage an existing booking
					</Link>
				</p>
			</div>
			<div className="container-outer pb-16 max-w-[760px]">
				{error && (
					<p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
						{error}
					</p>
				)}

				{step === 1 && (
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 md:p-8 space-y-4">
						<label className={labelCls}>
							<span className={spanCls}>Room *</span>
							<select
								value={roomId}
								onChange={(e) => setRoomId(Number(e.target.value))}
								className={inputCls}
							>
								<option value={0}>Select a room</option>
								{rooms.map((r) => (
									<option key={r.id} value={r.id}>
										{r.name}
										{r.startingPrice
											? ` — ${r.currency} ${r.startingPrice.toLocaleString()}/night`
											: ""}
									</option>
								))}
							</select>
						</label>
						<div className="grid sm:grid-cols-2 gap-4">
							<label className={labelCls}>
								<span className={spanCls}>Check-in *</span>
								<input
									type="date"
									min={today}
									value={checkin}
									onChange={(e) => setCheckin(e.target.value)}
									className={inputCls}
								/>
							</label>
							<label className={labelCls}>
								<span className={spanCls}>Check-out *</span>
								<input
									type="date"
									min={checkin || today}
									value={checkout}
									onChange={(e) => setCheckout(e.target.value)}
									className={inputCls}
								/>
							</label>
						</div>
						{nights > 0 && (
							<p className="text-sm text-[var(--muted)]">
								{nights} night{nights > 1 ? "s" : ""} selected.
							</p>
						)}
						<button
							onClick={checkAvailability}
							disabled={loading}
							className="w-full bg-[var(--forest)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition disabled:opacity-60"
						>
							{loading ? "Checking…" : "Check availability"}
						</button>
					</div>
				)}

				{step === 2 && (
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 md:p-8 space-y-4">
						<p className="text-sm text-[var(--muted)]">
							{roomName} · {checkin} → {checkout} · {nights} night
							{nights > 1 ? "s" : ""}
						</p>
						<div className="grid sm:grid-cols-3 gap-4">
							<label className={labelCls}>
								<span className={spanCls}>Adults</span>
								<input
									type="number"
									min={1}
									value={adults}
									onChange={(e) => setAdults(Number(e.target.value))}
									className={inputCls}
								/>
							</label>
							<label className={labelCls}>
								<span className={spanCls}>Children</span>
								<input
									type="number"
									min={0}
									value={children}
									onChange={(e) => setChildren(Number(e.target.value))}
									className={inputCls}
								/>
							</label>
							<label className={labelCls}>
								<span className={spanCls}>Infants</span>
								<input
									type="number"
									min={0}
									value={infants}
									onChange={(e) => setInfants(Number(e.target.value))}
									className={inputCls}
								/>
							</label>
						</div>
						<div className="grid sm:grid-cols-2 gap-4">
							<label className={labelCls}>
								<span className={spanCls}>Country</span>
								<input
									value={country}
									onChange={(e) => setCountry(e.target.value)}
									className={inputCls}
								/>
							</label>
							<label className={labelCls}>
								<span className={spanCls}>Purpose of visit</span>
								<input
									value={purpose}
									onChange={(e) => setPurpose(e.target.value)}
									placeholder="Leisure, trek, pilgrimage…"
									className={inputCls}
								/>
							</label>
						</div>
						<label className={labelCls}>
							<span className={spanCls}>Meal plan</span>
							<select
								value={mealPlan}
								onChange={(e) => setMealPlan(e.target.value)}
								className={inputCls}
							>
								<option value="">Room only</option>
								{(opts?.mealPlans ?? []).map((m) => (
									<option key={m.name} value={m.name}>
										{m.name} (+{opts?.currency} {m.price}/person/night)
									</option>
								))}
							</select>
						</label>
						<div className="grid sm:grid-cols-2 gap-4">
							<label className={labelCls}>
								<span className={spanCls}>Extra beds</span>
								<input
									type="number"
									min={0}
									value={extraBeds}
									onChange={(e) => setExtraBeds(Number(e.target.value))}
									className={inputCls}
								/>
							</label>
							<label className="flex items-center gap-3 pt-6 text-sm">
								<input
									type="checkbox"
									checked={pickup}
									onChange={(e) => setPickup(e.target.checked)}
									className="w-4 h-4"
								/>
								Airport pickup
							</label>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setStep(1)}
								className="px-6 py-3 rounded-full text-sm border border-[var(--line)]"
							>
								Back
							</button>
							<button
								onClick={calculate}
								disabled={loading}
								className="flex-1 bg-[var(--forest)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition disabled:opacity-60"
							>
								{loading ? "Calculating…" : "See price"}
							</button>
						</div>
						{quote && (
							<button
								onClick={() => setStep(3)}
								className="w-full bg-[var(--gold)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition"
							>
								Continue — {quote.currency} {quote.total.toLocaleString()} total
							</button>
						)}
					</div>
				)}

				{step === 3 && quote && (
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 md:p-8 space-y-4">
						<div className="bg-[var(--cream-2)] border border-[var(--line)] rounded-2xl p-5 text-sm space-y-1.5">
							<p className="font-medium text-[var(--forest)]">
								{roomName} · {nights} night{nights > 1 ? "s" : ""}
							</p>
							<p className="text-[var(--muted)]">
								{checkin} → {checkout} · {adults} adult{adults > 1 ? "s" : ""}
								{children > 0 && `, ${children} children`}
								{infants > 0 && `, ${infants} infants`}
							</p>
							{quote.lines.map((l) => (
								<p key={l.label} className="flex justify-between gap-4">
									<span className="text-[var(--muted)]">{l.label}</span>
									<span>
										{quote.currency} {l.amount.toLocaleString()}
									</span>
								</p>
							))}
							<p className="flex justify-between gap-4 font-medium text-[var(--forest)] border-t border-[var(--line)] pt-2">
								<span>Total (pay at hotel)</span>
								<span>
									{quote.currency} {quote.total.toLocaleString()}
								</span>
							</p>
						</div>
						<div className="grid sm:grid-cols-2 gap-4">
							<label className={labelCls}>
								<span className={spanCls}>Full name *</span>
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									className={inputCls}
								/>
							</label>
							<label className={labelCls}>
								<span className={spanCls}>Email *</span>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={inputCls}
								/>
							</label>
						</div>
						<label className={labelCls}>
							<span className={spanCls}>Phone</span>
							<input
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className={inputCls}
							/>
						</label>
						<label className={labelCls}>
							<span className={spanCls}>Special requests</span>
							<textarea
								rows={3}
								value={requests}
								onChange={(e) => setRequests(e.target.value)}
								className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-3 text-sm"
							/>
						</label>
						{(opts?.policies?.length ?? 0) > 0 && (
							<div className="bg-[var(--cream-2)] border border-[var(--line)] rounded-2xl p-5 text-sm space-y-1.5">
								<p className="font-medium text-[var(--forest)]">
									Good to know
									{opts?.checkIn && opts?.checkOut && (
										<span className="font-normal text-[var(--muted)]">
											{" "}
											· Check-in {opts.checkIn} · Check-out {opts.checkOut}
										</span>
									)}
								</p>
								<ul className="space-y-1.5">
									{(opts?.policies ?? []).map((p, i) => (
										<li
											key={i}
											className="flex gap-2.5 text-[var(--muted)] leading-relaxed"
										>
											<span
												aria-hidden
												className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]"
											/>
											{p}
										</li>
									))}
								</ul>
							</div>
						)}
						<label className="flex items-start gap-3 text-sm">
							<input
								type="checkbox"
								checked={agree}
								onChange={(e) => setAgree(e.target.checked)}
								className="w-4 h-4 mt-0.5"
							/>
							<span className="text-[var(--muted)]">
								I accept the booking policies above and understand I pay at
								the hotel.
							</span>
						</label>
						<div className="flex gap-3">
							<button
								onClick={() => setStep(2)}
								className="px-6 py-3 rounded-full text-sm border border-[var(--line)]"
							>
								Back
							</button>
							<button
								onClick={confirm}
								disabled={loading}
								className="flex-1 bg-[var(--gold)] text-white py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition disabled:opacity-60"
							>
								{loading ? "Confirming…" : "Confirm booking"}
							</button>
						</div>
					</div>
				)}

				{step === 4 && result && (
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 md:p-8 text-center">
						<p className="eyebrow text-[var(--moss)]">Confirmed</p>
						<h2 className="display text-[32px] text-[var(--forest)] mt-2">
							Booking {result.ref}
						</h2>
						<p className="text-sm text-[var(--muted)] mt-3 leading-relaxed">
							{roomName} · {checkin} → {checkout}
							<br />
							Total {result.currency} {result.total.toLocaleString()} — pay at
							the hotel. A confirmation email is on its way.
						</p>
						<Link
							href={`/booking/manage?ref=${result.ref}`}
							className="mt-6 inline-block border border-[var(--line)] px-6 py-2.5 rounded-full text-sm"
						>
							View / cancel booking
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
