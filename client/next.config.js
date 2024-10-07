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
};
