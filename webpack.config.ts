import webpack, { Configuration } from 'webpack';
import { mergeWithRules } from 'webpack-merge';
import path from 'path';
import grafanaConfig from './.config/webpack/webpack.config';

const config = async (env: any): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);
  const customConfig = {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    module: {
      rules: [
        {
          exclude: /(node_modules|libs)/,
        },
      ],
    },
    resolve: {
      alias: {
        '@/components': path.resolve(process.cwd(), 'src/components/'),
        '@/editors': path.resolve(process.cwd(), 'src/editors/'),
        '@/utils': path.resolve(process.cwd(), 'src/utils/'),
        '@/app': path.resolve(process.cwd(), 'src/app/'),
        '@/types': path.resolve(process.cwd(), 'src/types/'),
        '@/constants': path.resolve(process.cwd(), 'src/constants.ts'),
        '@/datasource': path.resolve(process.cwd(), 'src/datasource.ts'),
        '@/interpolate': path.resolve(process.cwd(), 'src/interpolate.ts'),
        '@/migrate': path.resolve(process.cwd(), 'src/migrate.ts'),
        '@/selectors': path.resolve(process.cwd(), 'src/selectors.ts'),
      },
      fallback: {
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        timers: require.resolve('timers-browserify'),
      },
    },
  };
  return mergeWithRules({
    module: {
      rules: {
        exclude: 'replace',
      },
    },
  })(baseConfig, customConfig);
};

export default config;
