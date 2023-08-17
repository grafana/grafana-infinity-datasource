const { withContentlayer } = require('next-contentlayer');

const repo = 'grafana-infinity-datasource';
const assetPrefix = `/${repo}/`;
const basePath = `/${repo}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  assetPrefix,
  output: 'export',
  distDir: 'out',
  // reactStrictMode: true,
  // swcMinify: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'user-images.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = {
  ...withContentlayer(nextConfig),
  // async redirects() {
  //   return [
  //     {
  //       source: '/wiki/:slug*',
  //       destination: '/docs/:slug*', // Matched parameters can be used in the destination
  //       permanent: true,
  //     },
  //   ];
  // },
};
