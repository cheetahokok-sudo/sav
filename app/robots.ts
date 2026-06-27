import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://savthai-new.example.com/sitemap.xml", // TODO: update once you have a domain
  };
}
