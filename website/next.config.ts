import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // A self-contained server for the Docker image (see Dockerfile)
  output: "standalone",
  poweredByHeader: false,
  // The website is its own app inside the extension's repository: trace and
  // bundle from here, not from the repository root and its lockfile
  outputFileTracingRoot: import.meta.dirname,
  turbopack: { root: import.meta.dirname },
  agentRules: false,
}

export default nextConfig
