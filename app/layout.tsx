import type { Metadata } from "next";
import { Barlow, Sarabun } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});

// TODO: replace with your real production URL once you have a domain.
const siteUrl = "https://savthai-new.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SAV Mechanical Services & Supplies | EOCR Motor Protection Thailand",
    template: "%s | SAV Mechanical Services & Supplies",
  },
  description:
    "ผู้นำเข้าและจัดจำหน่าย EOCR Overload Relay และ Samwha DSP จากเกาหลีโดยตรง — อุปกรณ์ป้องกันมอเตอร์ดิจิทัลคุณภาพสูง พร้อมทีมวิศวกรให้คำปรึกษา",
  keywords: [
    "EOCR Thailand",
    "Samwha DSP",
    "Overload Relay",
    "Motor Protection Relay",
    "รีเลย์ป้องกันมอเตอร์",
    "SAV Mechanical",
  ],
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: siteUrl,
    siteName: "SAV Mechanical Services & Supplies",
    title: "SAV Mechanical Services & Supplies | EOCR Motor Protection Thailand",
    description:
      "ผู้นำเข้าและจัดจำหน่าย EOCR Overload Relay และ Samwha DSP จากเกาหลีโดยตรง",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SAV Mechanical Services & Supplies Ltd., Part.",
  alternateName: "หจก. เอส เอ วี เมคคานิคคอล เซอร์วิสส์ แอนด์ ซัพพลายส์",
  url: "https://www.savthai.com",
  logo: `${siteUrl}/logo.png`,
  taxID: "0113530000263",
  address: {
    "@type": "PostalAddress",
    streetAddress: "107/58 หมู่ 8",
    addressLocality: "ตำบลบางเมือง อำเภอเมือง",
    addressRegion: "สมุทรปราการ",
    postalCode: "10270",
    addressCountry: "TH",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+66-2-702-8801",
      contactType: "sales",
      areaServed: "TH",
    },
    {
      "@type": "ContactPoint",
      telephone: "+66-85-212-0255",
      contactType: "sales",
      areaServed: ["International"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${barlow.variable} ${sarabun.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* TODO: Google Ads / GA4 tag — paste your gtag.js snippet here once you have an account ID */}
      </head>
      <body className="antialiased bg-gray-100">{children}</body>
    </html>
  );
}
