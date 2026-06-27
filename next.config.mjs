/** @type {import('next').NextConfig} */

// Set this to match your GitHub repo name if deploying to a GitHub Pages
// *project* site (https://<user>.github.io/<repo>/) -- e.g. "/sav".
// Leave it "" if you're using a custom domain or a <user>.github.io root repo.
const basePath = "/sav";

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
