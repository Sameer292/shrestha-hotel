"use client";
import { useState } from "react";

export default function ContactForm() {
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [errors, setErrors] = useState<Record<string, string>>({});

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const data = Object.fromEntries(fd.entries()) as Record<string, string>;
		const errs: Record<string, string> = {};
		if (!data.name || data.name.length < 2) errs.name = "Name is required";
		if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
			errs.email = "Valid email required";
		if (!data.subject || data.subject.length < 2)
			errs.subject = "Subject required";
		if (!data.message || data.message.length < 10)
			errs.message = "Message must be at least 10 characters";
		if (Object.keys(errs).length) {
			setErrors(errs);
			return;
		}
		setErrors({});
		setStatus("loading");
		// No real backend — simulate and show success. In prod, POST to /api/contact or WP.
		await new Promise((r) => setTimeout(r, 900));
		// ponytail: no real email delivery yet — wire to WP/Resend later
		setStatus("success");
		(e.target as HTMLFormElement).reset();
	}

	return (
		<form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
			<div className="grid sm:grid-cols-2 gap-4">
				<label className="block">
					<span className="text-xs tracking-wide text-[var(--muted)]">
						Name *
					</span>
					<input
						name="name"
						required
						aria-invalid={!!errors.name}
						className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--forest)]"
					/>
					{errors.name && (
						<span className="text-xs text-red-600 mt-1 block">
							{errors.name}
						</span>
					)}
				</label>
				<label className="block">
					<span className="text-xs tracking-wide text-[var(--muted)]">
						Email *
					</span>
					<input
						name="email"
						type="email"
						required
						aria-invalid={!!errors.email}
						className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--forest)]"
					/>
					{errors.email && (
						<span className="text-xs text-red-600 mt-1 block">
							{errors.email}
						</span>
					)}
				</label>
			</div>
			<div className="grid sm:grid-cols-2 gap-4">
				<label className="block">
					<span className="text-xs tracking-wide text-[var(--muted)]">
						Phone
					</span>
					<input
						name="phone"
						type="tel"
						className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--forest)]"
					/>
				</label>
				<label className="block">
					<span className="text-xs tracking-wide text-[var(--muted)]">
						Subject *
					</span>
					<input
						name="subject"
						required
						aria-invalid={!!errors.subject}
						className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--forest)]"
					/>
					{errors.subject && (
						<span className="text-xs text-red-600 mt-1 block">
							{errors.subject}
						</span>
					)}
				</label>
			</div>
			<label className="block">
				<span className="text-xs tracking-wide text-[var(--muted)]">
					Message *
				</span>
				<textarea
					name="message"
					required
					rows={5}
					aria-invalid={!!errors.message}
					className="mt-1 w-full border border-[var(--line)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--forest)]"
				/>
				{errors.message && (
					<span className="text-xs text-red-600 mt-1 block">
						{errors.message}
					</span>
				)}
			</label>

			{status === "success" && (
				<p
					role="status"
					className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
				>
					Thank you — your message has been received. We’ll reply soon. (Inquiry
					mode — wire to email/WP when ready.)
				</p>
			)}
			{status === "error" && (
				<p
					role="alert"
					className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
				>
					Something went wrong. Please try again or email us directly.
				</p>
			)}

			<button
				type="submit"
				disabled={status === "loading"}
				className="bg-[var(--forest)] text-white px-7 py-3 rounded-full text-sm font-medium hover:bg-[var(--forest-2)] transition disabled:opacity-60"
			>
				{status === "loading" ? "Sending…" : "Send Message"}
			</button>
			<p className="text-xs text-[var(--muted)]">
				No WordPress credentials are exposed in the frontend. Spam protection to
				be added via honeypot/Turnstile when backend is wired.
			</p>
		</form>
	);
}
