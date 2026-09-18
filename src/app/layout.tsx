import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { mockSettings } from "@/lib/wordpress/mock";
import { getHomeEntry, getHotelSettings, wpMedia } from "@/lib/wordpress/queries";

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

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [settings, home] = await Promise.all([
		getHotelSettings(),
		getHomeEntry(),
	]);
	const s = {
		...mockSettings,
		...settings,
		logoUrl: settings?.logoUrl ? wpMedia(settings.logoUrl) : "",
	};
	return (
		<html
			lang="en"
			className={`${display.variable} ${body.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<SmoothScroll>
					<Header
						bookingUrl={s.bookingUrl}
						hotelName={s.hotelName}
						phone={s.phone}
						email={s.email}
						logoUrl={s.logoUrl}
					/>
					<main className="flex-1">{children}</main>
					<Footer
						settings={s}
						footer={{
							background: home?.footerBackground,
							tagline: home?.footerTagline || undefined,
							subtagline: home?.footerSubtagline || undefined,
							description: home?.footerDescription || undefined,
						}}
					/>
				</SmoothScroll>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Hotel",
							name: s.hotelName,
							description: s.footerDescription,
							address: {
								"@type": "PostalAddress",
								addressLocality: "Beni",
								addressRegion: "Gandaki",
								addressCountry: "NP",
							},
							telephone: s.phone,
							email: s.email,
							url: "https://www.shresthahotel.com",
						}),
					}}
				/>
			</body>
		</html>
	);
}
