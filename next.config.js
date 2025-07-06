/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pg'],
  output: 'standalone'
};

module.exports = nextConfig;
