/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> outputs to /out, deployable to GitHub Pages (no Node server needed)
  output: "export",
  images: {
    unoptimized: true, // required for static export — no Next.js image server on GH Pages
  },
  trailingSlash: true, // avoids GitHub Pages 404s on folder-style routes

  // --- Only needed if you deploy to https://<user>.github.io/<repo-name>/ ---
  // (a "project site" instead of a custom domain or a <user>.github.io root repo).
  // Uncomment and set REPO_NAME to your actual GitHub repo name, then redeploy:
  //
  // basePath: "/REPO_NAME",
  // assetPrefix: "/REPO_NAME/",
};

export default nextConfig;
