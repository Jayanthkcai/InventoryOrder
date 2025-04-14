/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.infrastructureLogging = { level: "verbose" };
    return config;
  },
  // async redirects() {
  //     return [
  //       {
  //         source: '/pages', // Root path
  //         destination: '/login', // Redirect to the login page
  //         permanent: true, // Indicates a 308 permanent redirect
  //       },
  //     ];
  //   },
};

export default nextConfig;
