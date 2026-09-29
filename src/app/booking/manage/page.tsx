import ManageFlow from "@/components/booking/ManageFlow";

export const revalidate = 10;

export default function ManagePage() {
	return (
		<div className="pt-20">
			<div className="container-outer pt-8 pb-6">
				<p className="eyebrow text-[var(--moss)]">Manage booking</p>
				<h1 className="display text-[40px] md:text-[52px] text-[var(--forest)] leading-none mt-2">
					Find your stay
				</h1>
			</div>
			<ManageFlow />
		</div>
	);
}
