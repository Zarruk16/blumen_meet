/** @type {import('next').NextConfig} */
const nextConfig = {
  // Zego UIKit isn't StrictMode-safe in dev (double-invokes effects),
  // which can cause duplicate joinRoom() + internal null errors.
  reactStrictMode: false,
};

export default nextConfig;
