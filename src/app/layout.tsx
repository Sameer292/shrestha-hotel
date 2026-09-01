import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { mockSettings } from "@/lib/wordpress/mock";

const display = Cormorant_Garamond({
	subsets: ["latin"],
	variable: "--font-display",
	weight: ["400", "500", "600"],
	display: "swap",
});
const body = DM_Sans({
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "https://www.shresthahotel.com",
	),
	title: {
		default: "Shrestha Hotel Hotspring — Where the Mountains Meet Warm Waters",
		template: "%s — Shrestha Hotel Hotspring",
	},
	description:
		"A peaceful Himalayan retreat in Myagdi, Nepal — natural hot springs, mountain hospitality, and quiet luxury.",
	openGraph: {
		title: "Shrestha Hotel Hotspring",
		description:
			"Where the Mountains Meet Warm Waters — a peaceful Himalayan retreat with natural hot springs.",
		type: "website",
		locale: "en_NP",
	},
	twitter: { card: "summary_large_image" },
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`${display.variable} ${body.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<SmoothScroll>
					<Header bookingUrl={mockSettings.bookingUrl} />
					<main className="flex-1">{children}</main>
					<Footer />
					{/* WhatsApp floating — only if configured */}
					{mockSettings.whatsapp && (
						<a
							href={`https://wa.me/${mockSettings.whatsapp.replace(/[^0-9]/g, "")}`}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Chat on WhatsApp"
							className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white grid place-items-center shadow-lg hover:scale-105 transition"
						>
							<span className="text-sm font-bold">WA</span>
						</a>
					)}
				</SmoothScroll>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Hotel",
							name: "Shrestha Hotel Hotspring",
							description:
								"A peaceful Himalayan retreat with natural hot springs in Myagdi, Nepal.",
							address: {
								"@type": "PostalAddress",
								addressLocality: "Beni",
								addressRegion: "Gandaki",
								addressCountry: "NP",
							},
							telephone: mockSettings.phone,
							email: mockSettings.email,
							url: "https://www.shresthahotel.com",
						}),
					}}
				/>
			</body>
		</html>
	);
}
