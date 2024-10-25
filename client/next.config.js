module.exports = {
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    // Important: return the modified config
    config.watchOptions.poll = 300;
    return config;
  },
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === 'production'
        ? 'https://metabloit.xyz'
        : 'http://localhost:3000',
  },
};
