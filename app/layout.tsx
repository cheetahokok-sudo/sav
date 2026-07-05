import type { Metadata } from "next";
import { Barlow, Sarabun } from "next/font/google";
import "./globals.css";
import { COMPANY } from "./lib/company";

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
  name: COMPANY.nameEn,
  alternateName: COMPANY.nameTh,
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  taxID: COMPANY.taxId,
  foundingDate: String(COMPANY.registeredYearAD),
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
      // Primary number — answers phone, LINE, and WhatsApp.
      telephone: "+66-94-924-9829",
      contactType: "sales",
      areaServed: ["TH", "International"],
      availableLanguage: ["th", "en"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+66-2-702-8801",
      contactType: "sales",
      areaServed: "TH",
      availableLanguage: ["th"],
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
