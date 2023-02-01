// webpack.config.ts
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';

const config = async (env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);
  return merge(baseConfig, {
    // Add custom config here...
    output: { asyncChunks: true },
    resolve: { fallback: { os: false } },
  });
};

export default config;
