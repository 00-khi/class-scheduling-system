import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false, // uncomment this temporarily for debugging API calls

  /* config options here */
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/home/main/dashboard",
        permanent: false,
      },
      {
        source: "/home/main",
        destination: "/home/main/dashboard",
        permanent: false,
      },
      {
        source: "/home/academic-structure",
        destination: "/home/academic-structure/academic-qualifications",
        permanent: false,
      },
      {
        source: "/home/management",
        destination: "/home/management/manage-instructors",
        permanent: false,
      },
      {
        source: "/home/assignment",
        destination: "/home/assignment/subject-assigning",
        permanent: false,
      },
      {
        source: "/home/scheduling",
        destination: "/home/scheduling/subject-scheduling",
        permanent: false,
      },
      {
        source: "/home/announcement",
        destination: "/home/announcement/post-news-events",
        permanent: false,
      },
      {
        source: "/home/system",
        destination: "/home/system/settings",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
