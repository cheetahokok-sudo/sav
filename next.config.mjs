/** @type {import('next').NextConfig} */

// Empty because the site is served from the custom domain savautomation.com,
// where GitHub Pages publishes a project site at the ROOT. Set this back to
// "/sav" only if reverting to https://<user>.github.io/sav/.
const basePath = "";

const nextConfig = {
  // Static export -> outputs to /out, deployable to GitHub Pages (no Node server needed)
  output: "export",
  images: {
    unoptimized: true, // required for static export — no Next.js image server on GH Pages
  },
  trailingSlash: true, // avoids GitHub Pages 404s on folder-style routes

  ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),

  // Exposed so client components can correctly build paths to static files
  // in /public (like /products/index.json) regardless of basePath.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
