import { mockSettings } from "@/lib/wordpress/mock";
import ContactForm from "./ContactForm";

export const metadata = { title: "Contact — Get in Touch" };

export default function ContactPage() {
	const s = mockSettings;
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-10 grid lg:grid-cols-12 gap-10">
				<div className="lg:col-span-5">
					<p className="eyebrow text-[var(--moss)]">Contact</p>
					<h1 className="display text-[40px] md:text-[48px] text-[var(--forest)] leading-none mt-2">
						We’re here to help
						<br />
						you arrive
					</h1>
					<div className="mt-6 space-y-3 text-sm">
						<p>
							<strong className="text-[var(--forest)]">Address</strong>
							<br />
							<span className="text-[var(--muted)]">{s.address}</span>
						</p>
						<p>
							<strong className="text-[var(--forest)]">Phone</strong>
							<br />
							<a
								href={`tel:${s.phone}`}
								className="text-[var(--moss)] hover:underline"
							>
								{s.phone}
							</a>
						</p>
						<p>
							<strong className="text-[var(--forest)]">Email</strong>
							<br />
							<a
								href={`mailto:${s.email}`}
								className="text-[var(--moss)] hover:underline"
							>
								{s.email}
							</a>
						</p>
						<p>
							<strong className="text-[var(--forest)]">Hours</strong>
							<br />
							<span className="text-[var(--muted)]">
								Check-in {s.checkIn} • Check-out {s.checkOut}
							</span>
						</p>
					</div>
					<div className="rounded-[16px] overflow-hidden border border-[var(--line)] mt-6 aspect-[16/10] bg-[var(--stone)] relative">
						<iframe
							src={s.googleMapsEmbed}
							className="absolute inset-0 w-full h-full border-0"
							loading="lazy"
							title="Map"
						/>
					</div>
					<a
						href={s.googleMapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex mt-3 text-sm border-b border-[var(--forest)] pb-1"
					>
						Get Directions →
					</a>
				</div>
				<div className="lg:col-span-7">
					<div className="bg-white border border-[var(--line)] rounded-[20px] p-6 md:p-8">
						<h2 className="font-display text-xl text-[var(--forest)]">
							Send a message
						</h2>
						<p className="text-sm text-[var(--muted)] mt-2">
							We reply within a few hours. For urgent requests, call or
							WhatsApp.
						</p>
						<ContactForm />
					</div>
				</div>
			</div>
		</div>
	);
}
