// webpack.config.ts
import { Configuration, ProvidePlugin } from 'webpack';
import { merge } from 'webpack-merge';
import grafanaConfig from './.config/webpack/webpack.config';

const config = async (env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);
  return merge(baseConfig, {
    // Add custom config here...
    output: { asyncChunks: true },
    plugins: [
      // Work around for Buffer is undefined:
      // https://github.com/webpack/changelog-v5/issues/10
      new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    resolve: {
      fallback: {
        os: false,
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      },
    },
  });
};

export default config;
