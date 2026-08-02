import type { Metadata } from "next";
import { Barlow, Sarabun } from "next/font/google";
import "./globals.css";
import { COMPANY, SITE_URL } from "./lib/company";

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

const siteUrl = SITE_URL;

// Set NEXT_PUBLIC_GA_ID in the build environment to switch analytics on. Left
// unset the tag simply is not emitted — no placeholder ID, no broken request.
const gaId = process.env.NEXT_PUBLIC_GA_ID;

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

// One @graph so every page carries the same @id for the business, and other
// pages' JSON-LD (Product seller, Article publisher) can point at it by @id
// instead of restating the company. Typed as both Organization and
// LocalBusiness: it is a company entity AND a real address people visit.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${siteUrl}/#organization`,
      name: COMPANY.nameEn,
      alternateName: COMPANY.nameTh,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/sav-logo.png`,
        width: 590,
        height: 140,
      },
      image: `${siteUrl}/og-image.jpg`,
      taxID: COMPANY.taxId,
      foundingDate: String(COMPANY.registeredYearAD),
      email: COMPANY.email,
      telephone: COMPANY.intlPhoneDisplay,
      faxNumber: COMPANY.fax,
      sameAs: COMPANY.sameAs,
      address: {
        "@type": "PostalAddress",
        streetAddress: "107/58 หมู่ 8",
        addressLocality: "ตำบลบางเมือง อำเภอเมือง",
        addressRegion: "สมุทรปราการ",
        postalCode: "10270",
        addressCountry: "TH",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: COMPANY.latitude,
        longitude: COMPANY.longitude,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:30",
          closes: "17:30",
        },
      ],
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
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: COMPANY.nameEn,
      inLanguage: "th",
      publisher: { "@id": `${siteUrl}/#organization` },
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
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="antialiased bg-gray-100">{children}</body>
    </html>
  );
}
